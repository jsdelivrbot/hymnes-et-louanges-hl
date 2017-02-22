(function() {

  var router = require('./frontend-router');
  var showdown  = require('showdown'),
    converter = new showdown.Converter();
  /**
   * Group array into arrays of a particular size.
   * @param {!Array<Object>} arr
   * @param {number} size
   * @return {Array<Array<Object>}
   */
  function groupArray(arr, size) {
    return arr.map( function(e, i){ 
      return i % size=== 0 ? arr.slice(i, i + size) : null; 
    }).filter(function(e){ return e; });
  }

  /**
   * @param {string} mdText
   * @return {string}
   */
  function mdToHtml(mdText) {
    return converter.makeHtml(mdText);
  }

  module.exports = {
    groupArray: groupArray,
    mdToHtml: mdToHtml,
    all: router.all
  };
})();
