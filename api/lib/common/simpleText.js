const constants = require('./constants');


/**
 * @param {string} sentence - query to search
 * @return {string} - a simplify string with only english characters.
 */
function searchText(sentence) {
  sentence = sentence.toLowerCase();

  return sentence.replace(constants.SEARCH_REGEX_REGEX, function(matched){
    return constants.SEARCH_REPLACE_MAP[matched];
  });
}
module.exports.searchText = searchText;


/**
 * @param {string} sentence - words to index
 * @param {number} [limit=50] - How many words to index for long
 * sentence.
 * @return {Array<string>} - to match keys generated earlier for search map.
 */
module.exports.getKeys = function(sentence, limit){
  limit = limit || 50;
  sentence = sentence.split(' ').splice(0, limit);
  
  for (let i = 0; i < sentence.length; i++){
    sentence[i] = getKey(sentence[i]);
  }
  
  return sentence;
};


/**
 * @param {string} word - word to index
 * @return {string} - a key generate based on the given word.
 */
function getKey(word){
  word = word.toLowerCase();
  word = searchText(word);
  if (word.length < 1) {
    return false;
  }

  word = word.replace(/[^A-Za-z0-9]/g, '');
  
  // Remove similar ending for related words.
  if (word.length >= constants.SEARCH_KEY_END_IGNORE.length) {
    const last_char = word.substr(word.length - 1);
    for (const index in constants.SEARCH_KEY_END_IGNORE.remove){
      if (constants.SEARCH_KEY_END_IGNORE.remove[index] == last_char) {
        word = word.substr(0, word.length - 1);
        break;
      }
    }
  }
  return word;
}
module.exports.getKey = getKey;


/**
 * @param {string} query - word to structure
 * @return {string} - a modified query
 */
module.exports.preProcess = function(query){
  return query.replace('-', ' ');
};


/**
 * @param {string} text - phrase to index.
 * @return {string} - the first key character of the text capitalized.
 */
module.exports.getIndexer = function(text){
  if (!text || text.length < 1) {
    return text;
  }
  return getKey(text.substr(0, 1)).toUpperCase();
};


/**
 * @param {string} word - word to modify
 * @return {string} - a string with the first letter capitalized and the
 * remaining lowercased.
 */
module.exports.capKey = function(word){
  if (!word || word.length < 1) {
    return word;
  }
  return word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
};
