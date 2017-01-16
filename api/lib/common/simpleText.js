(function() {
  /**
   * @module
   * @desc A helper file to create text only using lower case string (simple)
   */

  const exporter = require('./exports');
  const constants = require('./constants');


  exporter.publicize(module, {

    SEARCH_IGNORE_MAP: constants.SEARCH_IGNORE_MAP,

    SEARCH_REPLACE_MAP: constants.SEARCH_REPLACE_MAP,

    SEARCH_REPLACE_REGEX: constants.SEARCH_REPLACE_REGEX,

    SEARCH_KEY_END_IGNORE: constants.SEARCH_KEY_END_IGNORE,

    /**
     * @param {string} sentence - query to search
     * @return {string} - a simplify string with only english characters.
     */
    searchText(sentence) {
      sentence = sentence.toLowerCase();

      return sentence.replace(this.SEARCH_REGEX_REGEX, function(matched){
        return this.SEARCH_REPLACE_MAP[matched];
      });
    },


    /**
     * @param {string} sentence - words to index
     * @param {number} [limit=50] - How many words to index for long
     * sentence.
     * @return {Array<string>} - to match keys generated earlier for search map.
     */
    getKeys(sentence, limit){
      limit = limit || 50;
      sentence = sentence.split(' ').splice(0, limit);
      
      for (let i = 0; i < sentence.length; i++){
        sentence[i] = this.getKey(sentence[i]);
      }
      
      return sentence;
    },


    /**
     * @param {string} word - word to index
     * @return {string} - a key generate based on the given word.
     */
    getKey(word){
      word = word.toLowerCase();
      word = this.searchText(word);
      if (word.length < 1) {
        return false;
      }

      word = word.replace(/[^A-Za-z0-9]/g, '');
      
      // Remove similar ending for related words.
      if (word.length >= this.SEARCH_KEY_END_IGNORE.length) {
        const last_char = word.substr(word.length - 1);
        for (const index in this.SEARCH_KEY_END_IGNORE.remove){
          if (this.SEARCH_KEY_END_IGNORE.remove[index] == last_char) {
            word = word.substr(0, word.length - 1);
            break;
          }
        }
      }
      return word;
    },


    /**
     * @param {string} query - word to structure
     * @return {string} - a modified query
     */
    preProcess(query){
      return query.replace('-', ' ');
    },


    /**
     * @param {string} text - phrase to index.
     * @return {string} - the first key character of the text capitalized.
     */
    getIndexer(text){
      if (!text || text.length < 1) {
        return text;
      }
      return this.getKey(text.substr(0, 1)).toUpperCase();
    },


    /**
     * @param {string} word - word to modify
     * @return {string} - a string with the first letter capitalized and the
     * remaining lowercased.
     */
    capKey(word){
      if (!word || word.length < 1) {
        return word;
      }
      return word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
    }
  });
})();
