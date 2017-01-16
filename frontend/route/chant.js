(function () {
  /**
   * Handles routing for the application.
   */

  'use strict';

  function getDescription(song) {
    var description = '';
    if (song) {
      description = song[song.parts[0]].join(' ');
    }
    return description;
  }

  function serve(app, root, appInfo, request){

    function handler(req, res) {
      var number = req.params.number || 1;
      request('/chant/' + number, function(data) {
        var tags = appInfo;
        tags.song = data;
        tags.title = data.title;
        tags.description = getDescription(data);
        res.render('chant.ejs', tags);
      });
    }

    app.get(root + '/chant', handler);
    app.get(root + '/chant/:number', handler);
  }

  module.exports = {
    serve: serve
  };
})();
