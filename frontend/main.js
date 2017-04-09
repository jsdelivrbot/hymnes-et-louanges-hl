(function() {
  var express = require('express');
  var args = require('minimist')(process.argv.slice(2))
  var app = express();

  function start(config, router) {
    var folder = config.destination;
    var base = config.dev.url  + ':' + (config.port + 1) + config.path + '/';
    var apiEndpoint = config.dev.api;
    if (process.argv[2] !== 'dev'){
      folder = config.root;
      base = config.prod.url + config.path + '/';
      apiEndpoint = config.prod.api;
      config.dev = false;
    }
    else {
      config.port += 1;
      config.dev = true;
    }
    if (args.api) {
      apiEndpoint = args.api !== 'dev' ? config.prod.api : config.dev.api;
    }
    require('./lib/frontend-config')(app, express, config, folder);
    require('./lib/REST')(app, config, base, apiEndpoint, router);
  }


  module.exports = {
    start: start,
    fs: require('fs'),
  };
})();
