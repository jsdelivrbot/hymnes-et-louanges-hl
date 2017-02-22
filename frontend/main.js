(function() {
  var express = require('express');
  var app = express();
<<<<<<< HEAD
=======
  Object.assign = require('object-assign');

>>>>>>> 594a7b2409950a73c5f2590898f907f0413356f0

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
    require('./lib/frontend-config')(app, express, config, folder);
    require('./lib/REST')(app, config, base, apiEndpoint, router);
  }


  module.exports = {
    start: start,
    fs: require('fs'),
  };
})();
