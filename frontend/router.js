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
      app.locals.render(res, 'main.ejs', appInfo);
    }

    function azHandler(req, res) {
      var letter = req.params.letter || 'A';
      request('/az/' + letter, res).then(data => {
        var tags = appInfo;
        tags.table = data;
        tags.table.selected = letter;
        tags.table.prefix = 'az';
        app.locals.render(res, 'az.ejs', tags);
      });
    }

    function numberHandler(req, res) {
      var number = req.params.number || 1;
      request('/number/' + number, res).then(data =>{
        var tags = appInfo;
        tags.table = data;
        tags.table.selected = number;
        tags.table.prefix = 'number';
        app.locals.render(res, 'az.ejs', tags);
      });
    }

    app.get(root + '/', appHandler);
    app.get(root + '/az', azHandler);
    app.get(root + '/az/:letter', azHandler);
    app.get(root + '/number', numberHandler);
    app.get(root + '/number/:number', numberHandler);
    app.get(root + '*', (_, res) => {
      app.locals.notFound(res);
    });
  };
})();
