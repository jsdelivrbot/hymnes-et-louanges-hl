(function() {
  module.exports = function(app, express, config, destFolder) {
    /**
     * Set the public path fo the application
     */
    var destFolders = ['/../' + destFolder, '/../static',
                       '/../' + config.mainFolder + '/static']
    destFolders.forEach(function(folder) {
      app.use(config.path, express.static(
          __dirname + folder,
          {maxAge: 31557600000}));
    });
    app.use(function(req, res, next) {
      res.setHeader('Date', new Date().toString());
      next();
    });

    /**
     * Set the view path for ejs render
     */
    app.set('view engine', 'ejs');
    app.set('views',  __dirname + '/../' + destFolder + '/views');
  };
})();
