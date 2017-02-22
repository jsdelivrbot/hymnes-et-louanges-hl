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

  app.locals.render = function(res, path, options) {
    res.render(path, options, (err, html) => {
      res.statusCode = 400;
      if (err) {
        console.error(err);
        res.render('error', {
          code: res.statusCode,
          info: 'Bad Request',
          message: 'The server cannot process the request' + 
            'due to something that is perceived to be a client error',
        });
      }
      else {
        res.send(html);
      }
    });
  }

  app.locals.notFound = function(res) {
    res.statusCode = 404;
    res.render('error', {
      code: res.statusCode,
      info: 'Resource not found',
      message: 'The requested resource could not be found but may be' +
        'available again in the future.',
    });
  };

  router(app, config.path, appInfo, getRequest, frontendUtils);

  var server = app.listen(config.port, function () {
    var host = server.address().address;
    console.log('Example app listening at %s', base);
    console.log('config.port:', config.port);
    console.log('Host:', host);
  });
};
