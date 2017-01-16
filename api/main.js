(function() {
  /**
   * Main file to start application api.
   */

  /**
   * Library imports.
   */
  const express = require('express');
  const app = express();
  const bodyParser = require('body-parser');
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
    const instance = args.get('instance', 'i') || 'dev';
    const isProd = instance === 'prod';
    let port = isProd ? config.port : config.port + 1;
    require('./lib/header')(app, express, bodyParser, config.path,
        baseDir, isProd);
    require('./lib/REST')(app, config, router, port, instance);
  }


  /**
   * Public exports for api module.
   */
  module.exports = {
    start: start,
    lib: lib,
  };
})();
