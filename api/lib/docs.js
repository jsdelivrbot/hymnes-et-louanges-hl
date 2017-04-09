const request = require('request');

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


module.exports = function(app, config) {
  const path = app.get('path');

  app.locals.PROTECTED_ROUTES = [];

  /**
   * Default page
   */
  app.get(path + '/', function(req, res) {
    req.query.response = '';
    if (submitRequest(req.query)) {
        let url = req.protocol + '://' + req.get('host') + req.path;
        url = url.substr(0, url.length -1) + req.query.endpoint;
        url = replaceUrl(url, req.query);
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200 && body) {
            req.query.response = JSON.stringify(JSON.parse(body), null, 2);
          }
          res.render('request', Object.assign(req.query, {
            sample: replaceUrl(req.query.endpoint, req.query),
            requestType: req.query.request,
            info: config.info,
          }));
        });
    }
    else if (req.query.request && req.query.endpoint) {
      res.render('form.ejs', Object.assign(config, {
        fields: findRequiredField(req.query.endpoint)
      }));
    }
    else {
      res.render('api-info.ejs', Object.assign(config, {
        endpoints: app.locals.API_URLS,
      }));
    }
  });
};
