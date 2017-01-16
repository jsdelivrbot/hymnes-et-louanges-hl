(function() {
  /**
   * @module
   * @desc Get all the endpoints from a directory
   */

  const exporter = require('./exports');
  const packager = require('./packager');


  exporter.publicize(module, {

    /**
     * Filters all JavaScript files in the given directory and load as module.
     * @param {!string} directory - all js request enpoint in a web app.
     * @return {void}
     */
    getEndpoints(directory) {
      const mainFolder = directory + '/endpoints';
      const files = packager.getJsFiles(mainFolder);
      let endpoints = [];
      files.forEach(path => {
        path = path.substr(path.lastIndexOf('/') + 1).replace('.js', '');
        const mod = require(mainFolder + '/' + path);
        endpoints.push(
          mod.getEndPoints ? mod.getEndPoints() : (mod.endpoints || {}));
      });
      return endpoints;
    },


    /**
     * @param {!string} directory - a valid path
     * @param {!Requester~requestCallback} cb - to handle each endpoint.
     * @return {void}
     */
    all(directory, cb) {
      this.getEndpoints(directory).forEach(cb);
    }
  });
})();
