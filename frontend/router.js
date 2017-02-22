(function () {
  /**
   * Handles routing for the application.
   */

  'use strict';


  module.exports = function(app, root, appInfo, request, router) {
    appInfo.pageTitle = 'Hymnes & Louanges';

    router.all(__dirname, function(route) {
      route.serve(app, root, appInfo, request);
    });

    function appHandler(req, res) {
      res.render('main.ejs', appInfo);
    }

    function azHandler(req, res) {
      var letter = req.params.letter || 'A';
      request('/az/' + letter, function(data) {
        var tags = appInfo;
        tags.table = data;
        tags.table.selected = letter;
        tags.table.prefix = 'az';
        res.render('az.ejs', tags);
      });
    }

    function numberHandler(req, res) {
      var number = req.params.number || 1;
      request('/number/' + number, function(data) {
        var tags = appInfo;
        tags.table = data;
        tags.table.selected = number;
        tags.table.prefix = 'number';
        res.render('az.ejs', tags);
      });
    }

    app.get(root + '/', appHandler);
    app.get(root + '/az', azHandler);
    app.get(root + '/az/:letter', azHandler);
    app.get(root + '/number', numberHandler);
    app.get(root + '/number/:number', numberHandler);
  };
})();
