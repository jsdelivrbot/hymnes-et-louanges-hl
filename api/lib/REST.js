(function() {
  /*
   * @desc Restful API - Handles all HTTP requests (GET, POST, PUT, DELETE);
   */

  const endpoints = require('./common/endpoints');
  const log = require('./common/log');
  const args = require('./common/args');
  const request = require('request');

  let API_URLS = {};

  /**
   * Finds necessary fields for an HTTP request
   * @example
   * // returns ['post_id']
   * const query = '/blog/:post_id';
   * findRequiredFileds(query);
   * @param {string} path - API url endpoint
   * @return {Array<string>} list of require request inputs.
   */
  function findRequiredField(path) {
    const sections = (path || '').split('/');
    return sections.reduce(function(res, section) {
      if (section && section[0] === ':') {
        res.push(section.substr(1));
      }
      return res;
    }, []);
  }


  /**
   * Decides whether to submit request automatically
   * @example
   * // returns true;
   * const query = {endpoint: '/app/info', request: 'GET'}
   * // returns false;
   * // Need to resolve value for :app_info first
   * const query = {endpoint: '/app/:info', request: 'GET'}
   * @param {!{
   *   endpoint: string,
   *   request: string,
   * }} query - request query details
   * @return {Boolean} submission decision
   */
  function submitRequest(query) {
    const fields = findRequiredField(query.endpoint);
    let submit = true;
    for (const x in fields) {
      if (!query[fields[x]]) {
        submit = false;
        break;
      }
    }
    return query.request && query.endpoint && submit;
  }


  /**
   * Update url to append require fields for an HTTP request
   * @example
   * // return blog/latest1234
   * const url = 'blog/:blog_id';
   * const query = {blog_id: 'lastest1234'};
   * replaceUrl(url, query);
   * @param {string} url - initial url
   * @param {!{
   *   endpoint: string,
   *   request: string,
   * }} query - request query details
   * @return {string} an updated url
   */
  function replaceUrl(url, query) {
    const fields = findRequiredField(query.endpoint);
    fields.forEach(function(field) {
      url = url.replace(':' + field, query[field]);
    });
    return url;
  }


  module.exports = function(app, config, router, port, instance){
    const path = config.path;

    /**
     * Default page
     */
    app.get(path + '/', function(req, res){
      req.query.response = '';
      if (submitRequest(req.query)) {
          let url = req.protocol + '://' + req.get('host') + req.path;
          url = url.substr(0, url.length -1) + req.query.endpoint;
          url = replaceUrl(url, req.query);
          request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              req.query.response = JSON.stringify(JSON.parse(body), null, 2);
            }
            res.render('request', req.query);
          });
      }
      else if (req.query.request && req.query.endpoint) {
        res.render('form.ejs', {
          title: config.info,
          fields: findRequiredField(req.query.endpoint)
        });
      }
      else {
        res.render('api-info.ejs', {
          endpoints: API_URLS,
          title: config.info
        });
      }
    });

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
        API_URLS[key] = (API_URLS[key] || []).concat(endpoint[key]);
        endpoint[key].forEach(function(route) {
          if (args.hasKey('describe')) {
            log.print('* %s %s', key.toUpperCase(), route.path);
          }
          log.debug('Added endpoint %s %s', key.toUpperCase(), route.path);
          app[key](path + route.path, route.handler);
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
        log.print('## %s', config.info);
      }
      endpoints.all(directory, Route);
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
      const server = app.listen(port, function () {
        const host = server.address().address;
        const port = server.address().port;
        log.info('Port: %s', port);
        log.info('Host: %s', host);
        log.info('Path: %s', config.path);
        log.info('Running %s instace instance', instance);
      });
    }
  };
})();
