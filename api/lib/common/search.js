(function() {
  /**
   * @module
   */

  const simpleText = require('./simpleText');
  const db = require('./database');
  const log = require('./log');
  const exporter = require('./exports');
  const fn = require('./functions');

  const TABLE = 'search';
  const RESULTS_TABLE = 'results';
  const LIMIT = 10;
  const CERTAINTY = 100;


  exporter.publicize(module, {

    /**
     * Remove all html tags.
     * @param {string} text - text to modify
     * @return {string} - without html tags
     */
    removeHtml(text) {                                                     
      const regex = /(((<span class([^.]+)span>))|<([^>]+)>)/ig;
      return text.replace(regex, ' ');
    },


    /**
     * Remove all string that are defined unsearchable by type.
     * @param {string} text - text to clean
     * @param {string} [type=html] - extension for the text.
     * @return {string} - a parsed text
     */
    clean(text, type) {
      if (!type || type === 'html') {
        return this.removeHtml(text);
      }
      return text;
    },


    /**
     * Create a search map for the given sentence.
     * @param {string} sentence - sentence to index for search
     * @param {string} ref - key for the sentence
     * @param {number} extra - value to increase search ranking
     * @param {Object} search - the current search map
     * @return {Object} the update search map
     */
    addToSearch(sentence, ref, extra, search){
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
    },


    /**
     * Create a map to quickly fetch results.
     * @param {string} paragraph - a text to index
     * @return {{
     *  w: Array<string>,
     *  m: Object
     * }} - result map
     */
    createResultMap(paragraph){
      const words = paragraph.split(' ');
      const map = {};
      words.forEach((word, index) => {
        word = simpleText.getKey(word);
        if (!map[word]){
          if (word.length > 0){
            map[word] = [index];
          }
        }
        else{
          map[word].push(index);
        }
      });
      return {
        m: map,
        w: words
      };
    },


    /**
     * Update or insert new search key.
     * @param {string} key - unique identifier in searchmap
     * @param {Array<Object>} results - data associate with the given key
     * @return {Promise} - resolved promised
     */
    upsert(key, results) {
      return new Promise((resolve, reject) => {
        const query = {key: key},
            update = {$push: {results: {$each: results}}};
        db.updateInfo(TABLE, query, update).then(data => {
          if (data && data.result && data.result.n === 0) {
            this.add(key, results).then(() => resolve());
          }
          resolve();
        }).catch(e => fn.reject(e, reject));
      });
    },


    /**
     * Insert new search key.
     * @param {string} key - unique identifier in searchmap
     * @param {Array<Object>} results - data associate with the given key
     * @return {Promise} - resolved promised
     */
    add(key, results) {
      return new Promise((resolve, reject) => {
        db.insertObj(TABLE, {key: key, results: results})
          .then(() => resolve())
          .catch(e => fn.reject(e, reject));
      });
    },


    /**
     * Insert map into result map.
     * @param {string} key - unique identifier in searchmap
     * @param {{
     *  w: Array<string>,
     *  m: Object
     * }} map - result map
     * @return {Promise} - resolved promised
     */
    addResult(key, map) {
      return new Promise((resolve, reject) => {
        map.key = key;
        db.upsertObj(RESULTS_TABLE, {key: key}, map).then(() => {
          log.debug('mapped: %s', key);
          resolve(key);
        }).catch(e => fn.reject(e, reject));
      });
    },


    /**
     * Remove all reference from search table for a given key.
     * @param {string} ref - unique search key
     * @return {Promise} - resolved promised
     */
    unmap(ref) {
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
    },


    /**
     * Map paragraph to both search and result table.
     * @param {string} title - has strong rank factor in search.
     * @param {string} paragraph - text to index
     * @param {object} resultMap - What the search result should look like.
     * @param {string} ref - unique search key
     * @return {void}
     */
    mapText(title, paragraph, resultMap, ref) {
      this.unmap(ref).then(() => {
        this.addResult(ref, resultMap);
        const search = this.addToSearch(title, ref, 10);
        this.addToSearch(paragraph, ref, 0, search);
        Object.keys(search).forEach(key => {
          this.upsert(key, search[key]);
        });
      });
    },

    /**
     * @param {Array<string>} refs - list of unique keys
     * @return {Promise} - resolved promised
     */
    unmapAll(refs) {
      return new Promise(resolve => {
        (function loop(i) {
          const ref = refs[i];
          this.unmap(ref).then(() => {
            if (++i === refs.length) {
              resolve();
            }
            else {
              loop.bind(this)(i);
            }
          });
        }).bind(this)(0);
      });
    },

    /**
     * @param {Array<Object>} map - search keys to index
     * @return {void}
     */
    addSearches(map) {
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
    },

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
    mapAll(searches, dropAll) {
      if (dropAll) {
        log.debug('dropping results table');
        db.drop(TABLE).then(() => {
          db.drop(RESULTS_TABLE).then(() => {
            this.mapEntries(searches);
          });
        });
      }
      else {
        const refs = searches.map(x => x.ref);
        this.unmapAll(refs).then(() => {
          this.mapEntries(searches);
        });
      }
    },

    /**
     * @param {Array<{
     *  title: string,
     *  paragraph: string,
     *  ref: string,
     *  result: Object
     * }>} searches - list of search entries to index
     * @return {void}
     */
    mapEntries(searches) {
      log.debug('Mapping %s entries', searches.length);
      let search = {};
      (function loop(i) {
        const entry = searches[i];
        if (entry) {
          this.addResult(entry.ref, entry.result).then(() => {
            this.addToSearch(entry.title, entry.ref, 10, search);
            this.addToSearch(entry.paragraph, entry.ref, 0, search);
            if (++i < searches.length) {
              loop.bind(this)(i);
            }
            else {
              this.addSearches(search);
            }
          });
        }
      }).bind(this)(0);
    },

    rankResults(previousWord, results, map) {
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
    },


    sortResults(map) {
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
    },


    handleSearch(data, words, certainty) {
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
              this.rankResults(previousWord, result, resultMap);
            }
          });
          log.debug(resultMap);
          let results = this.sortResults(resultMap).slice(0, LIMIT);
          log.debug('Found %s result', results.length);
          if (certainty && results.length > 1) {
            if ((results[0].value - results[1].value) > certainty) {
              results = results.slice(0, 1);
            }
          }
          resolve(results);
        }
      });
    },


    /*
     * @param {Array<{ref: string}>} keys - list of words to find.
     * @return {Promise} - resolved promised
     */
    fetchResults(keys) {
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
    },


    /**
     * @param {string} sentence - search query
     * @param {number=} certainty - maximum gap between first and second result
     *   to automatically select the first result.
     * @return {Promise} - resolved promised
     */
    search(sentence, certainty) {
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
            this.handleSearch(data, words, certainty).then(data => {
              this.fetchResults(data).then(data => resolve(data));
            });
          }
        });
      });
    }
  });
})();
