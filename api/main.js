(function() {
  /**
   * Main file to start application api.
   */

  /**
   * Library imports.
   */
  const express = require('express');
  const app = express();
  const lib = require('./lib/common');
  const args = require('./lib/common/args');
  const config = lib.config;

  args.setDefault('start', true);

  /**
   * Deploy the api
   * @param {!Object} router - module to manage API routes
   * @param {string} baseDir - root direcotry for the api.
   * @return {void}
   */
  function start(router, baseDir) {
    for (const key in config) {
      app.set(key, config[key]);
    }
    app.set('instance', args.get('instance', 'i') || 'dev');
    app.set('isProd', app.get('instance') === 'prod');
    app.set('port', app.get('isProd') ? config.port : config.port + 1);
    app.set('secret', 'secret');
    app.set('sessionAge', 60);  // in seconds
    require('./lib/header')(app, express, baseDir);
    require('./lib/authenticate')(app);
    require('./lib/docs')(app, config);
    require('./lib/rest')(app, router);
  }


  /**
   * Public exports for api module.
   */
  module.exports = {
    start: start,
    lib: lib,
  };
})();
