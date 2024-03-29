(function () {
  /**
   * Handles routing for the application.
   */

  'use strict';

  function serve(app, root, appInfo, request){

    function handler(req, res) {
      var number = req.params.number || 1;
      request('/presentation/' + number, res).then(data => {
        var tags = appInfo;
        tags.slides = data;
        tags.number = (data[0] || {}).number;
        app.locals.render(res, 'presentation.ejs', tags);
      });
    }

    app.get(root + '/presentation', handler);
    app.get(root + '/presentation/:number', handler);
  }

  module.exports = {
    serve: serve
  };
})();
