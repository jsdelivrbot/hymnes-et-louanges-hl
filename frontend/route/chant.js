(function () {
  /**
   * Handles routing for the application.
   */

  'use strict';

  function serve(app, root, appInfo, request){

    function handler(req, res) {
      var number = req.params.number || 1;
      request('/chant/' + number, function(data) {
        if (data.title) {
          var tags = appInfo;
          tags.song = data;
          tags.title = data.title;
          tags.description = data[data.parts[0]].join(' ');
          app.locals.render(res, 'chant.ejs', tags);
        }
        else {
          app.locals.clientError(res);
        }
      });
    }

    app.get(root + '/chant', handler);
    app.get(root + '/chant/:number', handler);
  }

  module.exports = {
    serve: serve
  };
})();
