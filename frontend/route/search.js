(function () {
  /**
   * Handles routing for the application.
   */

  'use strict';

  function validSongNumber(song) {
    var number = parseInt(song, 10);
    return !isNaN(number) && number > 0 && number <= 654;
  }

  function serve(app, root, appInfo, request){

    function handler(req, res) {
      var query = req.params.query || '';
      if (validSongNumber(query)) {
        res.redirect(root + '/chant/' + query);
        return;
      }
      request('/search/' + query, function(data) {
        if (data.length === 1) {
          res.redirect(root + '/chant/' + data[0].number);
        }
        else {
          var tags = appInfo;
          tags.query = query;
          tags.results = data;
          app.locals.render(res, 'search.ejs', tags);
        }
      });
    }

    app.get(root + '/search', handler);
    app.get(root + '/search/:query', handler);
  }

  module.exports = {
    serve: serve
  };
})();
