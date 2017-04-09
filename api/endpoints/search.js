/*
* File to interact with database.
*/
const api = require('./../main');
const search = api.lib.search;

const LIMIT = 10;  // Maximum number of words to search;
const CERTAINTY = 50;


/**
 * @param {!{
 *  params: {query: string}
 * }} req - HTTP Request
 * @param {!{
 *  send: function
 * }} res - HTTP Response
 * @return {void}
 */
function handler(req, res) {
  if (!req.params.query) {
    res.send([]);
    return;
  }
  const query = req.params.query.split(' ').splice(0, LIMIT).join(' ');
  search.search(query, CERTAINTY).then(response => {
    res.send(response);
  });
}

/**
 * Modules endpoints
 * @return {void}
 */
module.exports.getEndPoints = function() {
  return {
    get: [
      {
        path: '/search',
        sample: '/search',
        title: 'Search (empty)',
        handler: handler,
        response: '[]',
      },
      {
        path: '/search/:query',
        sample: '/search/reste avec nous',
        title: 'Search',
        handler: handler,
        responsePath: './docs/search-response.json',
      },
    ],
  };
}
