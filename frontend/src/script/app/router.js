(function() {

  app.initialRoute = 'home';

  app.paths = [
    // {re: [/about/i], file: 'about'},
  ];

  app.fileRouter = function(path) {
    for (var p in app.paths) {
      for (var r in app.paths[p]) {
        var regex = app.paths[p][r];
        console.log(regex);
        if (path.match(regex)) {
          return app.paths[p].file;
        }
      }
    }
  };

  app.routeActions = {
    home: {
    },
  };
})();
