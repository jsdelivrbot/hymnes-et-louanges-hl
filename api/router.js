(function() {
  /*
   * @desc Loads all endpoints for the api found under the enpdpoint/ directory
   * AUTO Generated file.
   */

  /**
   * Loads API modules.
   */
  const api = require('./main');

  /**
   * Helper module to find all endpoints in the current API
   */
  const endpoints = api.lib.endpoints;

  /**
   * Exports function to initialize the API
   */
  api.lib.exports.publicize(module, function(app) {
    app.initializeApi(__dirname);
  });
})();
