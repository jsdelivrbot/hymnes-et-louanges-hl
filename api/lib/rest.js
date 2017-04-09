const endpoints = require('./common/endpoints');
const log = require('./common/log');
const args = require('./common/args');
const fs = require('fs');

/**
 * @param {!string} text - input to parse to element-id
 * @return {string} dashed-case
 */
function toHtmlId(text){
  return text.replace(/[^0-9a-zA-Z]/g, '').replace(
    /([A-Z])/g, function($1) {return '-' + $1.toLowerCase();});
}

module.exports = function(app, router) {

  const path = app.get('path');

  /**
   * Define api local variables
   */
  app.locals.PROTECTED_ROUTES = [];
  app.locals.API_URLS = [];
  app.locals.cookieOptions = {
    path,
    maxAge: 60 * 1000 * 1000,
    httpOnly: false,
  };

  /**
   * Dynamically load load all routes.
   * @param {!{
   *  key: Array<{path: string, handler: !Function}>
   * }} endpoint - map of each request and their handlers.
   * @return {void}
   */
  function Route(endpoint) {
    const keys = Object.keys(endpoint);
    keys.forEach(function(key) {
      endpoint[key].forEach(function(route) {
        if (args.hasKey('describe')) {
          log.print('* %s %s', key.toUpperCase(), route.path);
        }
        const requestType = key.toUpperCase();
        log.debug('Added endpoint %s %s', requestType, route.path);
        app[key](path + route.path, route.handler);
        route.title = route.title || route.path;
        if (route.responsePath) {
          route.response = fs.readFileSync(route.responsePath, 'utf-8');
        }
        app.locals.API_URLS.push(Object.assign(route, {
          requestType,
          id: `${toHtmlId(route.title)}`,
        }));
        if (route.auth) {
          app.locals.PROTECTED_ROUTES.push(
            `${key}${path}${route.path.replace(/:[a-zA-Z-]+/g, '*')}`);
        }
      });
    });
  }

  /**
   * Initialize the API and mount all the endpoints.
   * @param {string} directory - root path for the API.
   * @return {void}
   */
  app.initializeApi = function(directory) {
    if (args.hasKey('describe')) {
      log.print('## %s', app.get('info'));
    }
    endpoints.all(directory, Route);
  };

  /**
   * Helper to allow caller to define additional local variable
   * @param {!Object} obj - map of additional local variables
   * @return {void}
   */
  app.defineLocals = function(obj) {
    for (const key in obj || {}) {
      app.locals[key] = obj[key];
    }
  };

  /**
   * Provide capability to add addiotional routes to the application.
   */
  if (typeof router === 'function') {
    router(app, path);
  }

  if (args.options.start) {
    /**
     * Deploy application.
     */
    const server = app.listen(app.get('port'), function () {
      const host = server.address().address;
      const port = server.address().port;
      log.info('Port: %s', port);
      log.info('Host: %s', host);
      log.info('Path: %s', app.get('path'));
      log.info('Running %s instace instance', app.get('instance'));
    });
  }
  else {
    process.exit(0);
  }
};
