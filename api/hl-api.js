(function() {
  /*
   * @desc Main file for the API
   * AUTO Generated file.
   */

  /**
   * Loads API modules.
   */
  const api = require('./main');

  /**
   * Gets the supported paths for the application.
   */
  const router = require('./router');

  /**
   * Starts the api.
   */
  api.start(router, __dirname);
})();
