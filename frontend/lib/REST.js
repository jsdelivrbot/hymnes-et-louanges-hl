/*
 * Restful API for the applicaiton--Handle all GET and POST request.
 */

var request = require('request');
var frontendUtils = require('./frontend-utils');

module.exports = function(app, config, base, serverUrl, router){

  var appInfo = Object.assign(config, {
    serverUrl: serverUrl,
    staticFolder: config.static,
    lang: 'en',
    base: base
  });

  function getRequest(link, res) {
    return new Promise((resolve, reject) => {
      link = link.replace(config.path, '');
      if (!link.startsWith('http')) {
        link = serverUrl + link;
      }
      request(link, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve(JSON.parse(body));
        }
        else if (res) {
          app.locals.clientError(res);
        }
        else {
          reject();
        }
      });
    });
  }

  app.locals.render = function(res, path, options) {
    res.render(path, options, (err, html) => {
      if (err) {
        console.error(err);
        app.locals.clientError(res);
      }
      else {
        res.send(html);
      }
    });
  }

  app.locals.clientError = function(res) {
    res.statusCode = 400;
    res.render('http-code-tmpl', {
      code: res.statusCode,
      info: 'Bad Request',
      message: 'The server cannot process the request' + 
        'due to something that is perceived to be a client error',
    });
  }

  app.locals.notFound = function(res) {
    res.statusCode = 404;
    res.render('http-code-tmpl', {
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
