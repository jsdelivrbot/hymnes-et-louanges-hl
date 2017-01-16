(function() {
  /*
   * File to interact with database.
   */
  const api = require('./../main');
  const search = api.lib.search;
  const exporter = api.lib.exports;

  const LIMIT = 10;  // Maximum number of words to search;
  const CERTAINTY = 50;

  exporter.publicize(module, {

    /**
     * @param {!{
     *  params: {query: string}
     * }} req - HTTP Request
     * @param {!{
     *  send: function
     * }} res - HTTP Response
     * @return {void}
     */
    handler(req, res) {
      if (!req.params.query) {
        res.send([]);
        return;
      }
      query = req.params.query.split(' ').splice(0, LIMIT).join(' ');
      search.search(query, CERTAINTY).then(response => {
        res.send(response);
      });
    },

    /**
     * Modules endpoints
     * @return {void}
     */
    getEndPoints() {
      return {
        get: [
          {path: '/search', handler: this.handler},
          {path: '/search/:query', handler: this.handler},
        ],
      };
    }
  });
})();
