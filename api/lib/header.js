const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const log = require('./common/log');

module.exports = function(app, express, baseDir) {
  if (!app.get('isProd')) {
    baseDir = __dirname + '/..';
  }

  /**
   * Set the public path fo the application
   */
  app.set('view engine', 'ejs');
  app.set('views',  baseDir + '/views');

  /**
   * Load local directories
   */
  app.use(app.get('path'),
    express.static(baseDir + '/static', {maxAge: 999999}));
  app.use(app.get('path'),
    express.static(baseDir + '/uploads', {maxAge: 999999}));

  /**
   * Define default headers for the application.
   */
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
      'Content-Type,accept,access_token,X-Requested-With');
    res.setHeader('Date', (new Date()).toString());
    next();
  });

  /**
   * Initialize body parser for POST methods
   */
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  /**
   * Add parser to get/set cookies.
   */
  app.use(cookieParser());

  app.use((req, _, next) => {
    log.debug('Serving %s %s', req.method, req.path);
    next();
  });
};
