(function() {
  /**
   * Get all the routes from a directory
   */

  /**
   * Library Imports
   */
  var fs = require('fs');


  /**
   * Recursive call to find all files in a path.
   * @param {!string} dir - valid directory path
   * @param {Array<string>} directory
   */
  function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
  }

  /**
   * Filters all JavaScript files in the given directory and load as module.
   * @param {!string} directory
   */
  function getRoutes(directory) {
    var mainFolder = directory + '/route';
    var files = getFiles(mainFolder);
    files = files.filter(function(f) {
      return String(f.match('.js$')) === '.js';
    });
    var routes = [];
    files.forEach(function(path) {
      path = path.substr(path.lastIndexOf('/') + 1).replace('.js', '');
      routes.push(require(mainFolder + '/' + path));
    });
    return routes;
  }


  /**
   * @param {!string} directory
   * @param {!Requester~requestCallback} cb - function to handle each endpoint.
   */
  function all(directory, cb) {
    getRoutes(directory).forEach(cb);
  }


  /**
   * Public exports for the routes module.
   */
  module.exports = {
    all: all
  };
})();
