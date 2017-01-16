/*
 * Restful API for the applicaiton--Handle all GET and POST request.
 */

var request = require('request');
var frontendUtils = require('./frontend-utils');

module.exports = function(app, config, base, serverUrl, router){

  var appInfo = {
    mainFile: config.mainFile,
    title: config.title,
    description: config.description,
    image: config.image,
    serverUrl: serverUrl,
    dev: config.dev,
    staticFolder: config.static,
    lang: 'en',
    base: base
  };

  function getRequest(link, cb) {
    link = link.replace(config.path, '');
    request(serverUrl + link, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        cb(JSON.parse(body || {}));
      }
      else {
        cb({});
      }
    });
  }


  router(app, config.path, appInfo, getRequest, frontendUtils);


  var server = app.listen(config.port, function () {
    var host = server.address().address;
    console.log('Example app listening at %s', base);
    console.log('config.port:', config.port);
    console.log('Host:', host);
  });
};
