(function() {

<<<<<<< HEAD
  const bodyParser = require('body-parser');
  const cookieParser = require('cookie-parser');
  const log = require('./common/log');

  module.exports = function(app, express, baseDir) {
    if (!app.get('isProd')) {
      baseDir = __dirname + '/..';
    }
=======
  module.exports = function(app, express, bodyParser, path, baseDir, isProd) {
>>>>>>> 594a7b2409950a73c5f2590898f907f0413356f0

    /**
     * Set the public path fo the application
     */
    app.set('view engine', 'ejs');
<<<<<<< HEAD
    app.set('views',  baseDir + '/views');

    /**
     * Load local directories
     */
    app.use(app.get('path'),
      express.static(baseDir + '/static', {maxAge: 999999}));
    app.use(app.get('path'),
      express.static(baseDir + '/uploads', {maxAge: 999999}));
=======

    if (!isProd) {
      baseDir = __dirname + '/..';
    }

    app.set('views',  baseDir + '/views');
    app.use(path, express.static(baseDir + '/static', {maxAge: 999999}));
    app.use(path, express.static(baseDir + '/uploads', {maxAge: 999999}));
>>>>>>> 594a7b2409950a73c5f2590898f907f0413356f0

    /**
     * Define default headers for the application.
     */
<<<<<<< HEAD
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers',
        'Content-Type,accept,access_token,X-Requested-With');
=======
    app.use(function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers',
                 'Content-Type,accept,access_token,X-Requested-With');
>>>>>>> 594a7b2409950a73c5f2590898f907f0413356f0
      res.setHeader('Date', (new Date()).toString());
      next();
    });

    /**
     * Initialize body parser for POST methods
     */
<<<<<<< HEAD
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
=======
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  };

>>>>>>> 594a7b2409950a73c5f2590898f907f0413356f0
})();
