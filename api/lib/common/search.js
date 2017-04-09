const simpleText = require('./simpleText');
const db = require('./database');
const log = require('./log');
const fn = require('./functions');

const TABLE = 'search';
const RESULTS_TABLE = 'results';
const LIMIT = 10;
const CERTAINTY = 100;


/**
 * Remove all html tags.
 * @param {string} text - text to modify
 * @return {string} - without html tags
 */
function removeHtml(text) {                                                     
  const regex = /(((<span class([^.]+)span>))|<([^>]+)>)/ig;
  return text.replace(regex, ' ');
}


/**
 * Remove all string that are defined unsearchable by type.
 * @param {string} text - text to clean
 * @param {string} [type=html] - extension for the text.
 * @return {string} - a parsed text
 */
function clean(text, type) {
  if (!type || type === 'html') {
    return removeHtml(text);
  }
  return text;
}
module.exports.clean = clean;


/**
 * Create a search map for the given sentence.
 * @param {string} sentence - sentence to index for search
 * @param {string} ref - key for the sentence
 * @param {number} extra - value to increase search ranking
 * @param {Object} search - the current search map
 * @return {Object} the update search map
 */
function addToSearch(sentence, ref, extra, search){
  search = search || {};
  if (!sentence) {
    return search;
  }
  sentence = simpleText.preProcess(sentence);
  const words = sentence.split(' ');
  let previous = false;
  for (const word of words) {
    const key = simpleText.getKey(word);
    if (!key || key.length < 1) {
      continue;
    }
    if (simpleText.SEARCH_IGNORE_MAP[key] === 1) {
      search[key] = [];
      continue;
    }
    if (!search[key]) search[key] = [];
    const entry = {result: ref};
    if (previous) entry.prev = previous;
    if (extra && extra > 0) entry.extra = extra;
    search[key].push(entry);
    previous = key;
  }
  return search;
}


/**
 * Update or insert new search key.
 * @param {string} key - unique identifier in searchmap
 * @param {Array<Object>} results - data associate with the given key
 * @return {Promise} - resolved promised
 */
function upsert(key, results) {
  return new Promise((resolve, reject) => {
    const query = {key: key},
        update = {$push: {results: {$each: results}}};
    db.updateInfo(TABLE, query, update).then(data => {
      if (data && data.result && data.result.n === 0) {
        add(key, results).then(() => resolve());
      }
      resolve();
    }).catch(e => fn.reject(e, reject));
  });
}


/**
 * Insert new search key.
 * @param {string} key - unique identifier in searchmap
 * @param {Array<Object>} results - data associate with the given key
 * @return {Promise} - resolved promised
 */
function add(key, results) {
  return new Promise((resolve, reject) => {
    db.insertObj(TABLE, {key: key, results: results})
      .then(() => resolve())
      .catch(e => fn.reject(e, reject));
  });
}


/**
 * Insert map into result map.
 * @param {string} key - unique identifier in searchmap
 * @param {{
 *  w: Array<string>,
 *  m: Object
 * }} map - result map
 * @return {Promise} - resolved promised
 */
function addResult(key, map) {
  return new Promise((resolve, reject) => {
    map.key = key;
    db.upsertObj(RESULTS_TABLE, {key: key}, map).then(() => {
      log.debug('mapped: %s', key);
      resolve(key);
    }).catch(e => fn.reject(e, reject));
  });
}


/**
 * Remove all reference from search table for a given key.
 * @param {string} ref - unique search key
 * @return {Promise} - resolved promised
 */
function unmap(ref) {
  return new Promise((resolve, reject) => {
    db.remove(RESULTS_TABLE, {key: ref}).then(() => {
      const selector = {'$pull': {results: {result: ref}}};
      db.updateInfo(TABLE, {}, selector).then(() => {
        db.remove(TABLE, {results: {$size: 0}}).then(() => {
          log.debug('unmapped: %s', ref);
          resolve();
        });
      }).catch(e => fn.reject(e, reject));
    });
  });
}
module.exports.unmap = unmap;


/**
 * Map paragraph to both search and result table.
 * @param {string} title - has strong rank factor in search.
 * @param {string} paragraph - text to index
 * @param {object} resultMap - What the search result should look like.
 * @param {string} ref - unique search key
 * @return {void}
 */
module.exports.mapText = function(title, paragraph, resultMap, ref) {
  unmap(ref).then(() => {
    addResult(ref, resultMap);
    const search = addToSearch(title, ref, 10);
    addToSearch(paragraph, ref, 0, search);
    Object.keys(search).forEach(key => {
      upsert(key, search[key]);
    });
  });
};

/**
 * @param {Array<string>} refs - list of unique keys
 * @return {Promise} - resolved promised
 */
function unmapAll(refs) {
  return new Promise(resolve => {
    (function loop(i) {
      const ref = refs[i];
      unmap(ref).then(() => {
        if (++i === refs.length) {
          resolve();
        }
        else {
          loop.bind(this)(i);
        }
      });
    }).bind(this)(0);
  });
}
module.exports.unmapAll = unmapAll;

/**
 * @param {Array<Object>} map - search keys to index
 * @return {void}
 */
function addSearches(map) {
  return new Promise((resolve, reject) => {
    const query = {$or: Object.keys(map).map(key => ({key}))};
    db.findAll(TABLE, query).then(data => {
      for (const search of data) {
        search.results = search.results.concat(map[search.key]);
        delete search._id;
        delete map[search.key];
      }
      const insertion = Object.keys(map).map(
        key => Object.assign({key}, {results: map[key]})).concat(data);
      db.remove(TABLE, query).then(() => {
        db.insertMany(TABLE, insertion).then(() => {
          log.debug('Updated %s search terms', insertion.length);
          resolve();
        }).catch(e => fn.reject(e, reject));
      });
    });
  });
}

/**
 * @param {Array<{
 *  title: string,
 *  paragraph: string,
 *  ref: string,
 *  result: Object
 * }>} searches - list of search entries to index
 * @param {boolean} dropAll - set true drop current search map
 * @return {void}
 */
module.exports.mapAll = function(searches, dropAll) {
  if (dropAll) {
    log.debug('dropping results table');
    db.drop(TABLE).then(() => {
      db.drop(RESULTS_TABLE).then(() => {
        mapEntries(searches);
      });
    });
  }
  else {
    const refs = searches.map(x => x.ref);
    unmapAll(refs).then(() => {
      mapEntries(searches);
    });
  }
}

/**
 * @param {Array<{
 *  title: string,
 *  paragraph: string,
 *  ref: string,
 *  result: Object
 * }>} searches - list of search entries to index
 * @return {void}
 */
function mapEntries(searches) {
  log.debug('Mapping %s entries', searches.length);
  let search = {};
  (function loop(i) {
    const entry = searches[i];
    if (entry) {
      addResult(entry.ref, entry.result).then(() => {
        addToSearch(entry.title, entry.ref, 10, search);
        addToSearch(entry.paragraph, entry.ref, 0, search);
        if (++i < searches.length) {
          loop.bind(this)(i);
        }
        else {
          addSearches(search);
        }
      });
    }
  }).bind(this)(0);
}

/**
 * @param {string} previouWord preceding word from the word to rank.
 * @param {!Array<!{
 *  result: string
 *  prev: string,
 *  extra: number
 * }>} results list of results.
 * @param {!Object} map Map of searched words.
 * @return {void}
 */
function rankResults(previousWord, results, map) {
  results.forEach(result => {
    const key = result.result;
    if (!map[key]) {
      map[key] = 5;
    }
    else {
      map[key] += 2;
    }
    const isPrevious = previousWord && result.prev === previousWord;
    map[key] += isPrevious ? 10 : 0;
    map[key] += (result.extra)? result.extra : 0;
    map[key] += (result.extra && isPrevious)? result.extra * 4: 0;
  });
}


/**
 * @param {!Object} map Map of searched words.
 * @return {Array<Object>} a sorted list of results.
 */
function sortResults(map) {
  const results = Object.keys(map).sort((a, b) => {
    return map[b] - map[a];
  });
  return results.reduce((result, ref) => {
    result.push({
      value: map[ref],
      ref: ref
    });
    return result;
  }, []);
}


function handleSearch(data, words, certainty) {
  return new Promise((resolve) => {
    if (data) {
      let resultMap = {},
          previousWord,
          searchMap = {};
      data.forEach(result => {
        searchMap[result.key] = result.results;
      });
      words.forEach((word, index) => {
        if (index > 0) {
          previousWord = words[index-1];
        }
        const result = searchMap[word];
        if (result) {
          rankResults(previousWord, result, resultMap);
        }
      });
      log.debug(resultMap);
      let results = sortResults(resultMap).slice(0, LIMIT);
      log.debug('Found %s result', results.length);
      if (certainty && results.length > 1) {
        if ((results[0].value - results[1].value) > certainty) {
          results = results.slice(0, 1);
        }
      }
      resolve(results);
    }
  });
}


/*
 * @param {Array<{ref: string}>} keys - list of words to find.
 * @return {Promise} - resolved promised
 */
function fetchResults(keys) {
  return new Promise((resolve) => {
    if (keys.length === 0) {
      resolve([]);
    }
    else {
      keys = keys.splice(0, LIMIT);
      const selector = {_id: 0},
          query = {'$or': []};
      keys.forEach(key => {
        query.$or.push({key: key.ref});
      });
      db.findAll(RESULTS_TABLE, query, selector).then(data => {
        const results = [];
        keys.forEach(key => {
          const item = data.filter(item => {
            return item.key === key.ref;
          })[0];
          results.push(item);
        });
        resolve(results);
      });
    }
  });
}


/**
 * @param {string} sentence - search query
 * @param {number=} certainty - maximum gap between first and second result
 *   to automatically select the first result.
 * @return {Promise} - resolved promised
 */
module.exports.search = function(sentence, certainty) {
  return new Promise((resolve) => {
    certainty = certainty || CERTAINTY;
    log.debug('Searching %s', sentence);
    const words = simpleText.getKeys(sentence);
    if (words.length === 0) {
      resolve([]);
    }
    const query = {'$or': []};
    words.forEach(key => {
      query.$or.push({key: key});
    });
    db.findAll(TABLE, query, {}).then(data => {
      if (data) {
        handleSearch(data, words, certainty).then(data => {
          fetchResults(data).then(data => resolve(data));
        });
      }
    });
  });
}
