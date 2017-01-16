(function() {

  module.exports = function(app, express, bodyParser, path, baseDir, isProd) {

    /**
     * Set the public path fo the application
     */
    app.set('view engine', 'ejs');

    if (!isProd) {
      baseDir = __dirname + '/..';
    }

    app.set('views',  baseDir + '/views');
    app.use(path, express.static(baseDir + '/static', {maxAge: 999999}));
    app.use(path, express.static(baseDir + '/uploads', {maxAge: 999999}));

    /**
     * Define default headers for the application.
     */
    app.use(function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers',
                 'Content-Type,accept,access_token,X-Requested-With');
      res.setHeader('Date', (new Date()).toString());
      next();
    });

    /**
     * Initialize body parser for POST methods
     */
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  };

})();
