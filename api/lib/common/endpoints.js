const packager = require('./packager');


/**
 * Filters all JavaScript files in the given directory and load as module.
 * @param {!string} directory - all js request enpoint in a web app.
 * @return {void}
 */
function getEndpoints(directory) {
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
}
module.exports.getEndpoints = getEndpoints;


/**
 * @param {!string} directory - a valid path
 * @param {!Requester~requestCallback} cb - to handle each endpoint.
 * @return {void}
 */
module.exports.all = function(directory, cb) {
  this.getEndpoints(directory).forEach(cb);
};
