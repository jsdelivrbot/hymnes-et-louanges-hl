/**
* @module
*/
const minimist = require('minimist');


const options = minimist(process.argv.slice(2));
const command = process.argv[2];
const operation = process.argv[3];

module.exports.options = options;
module.exports.command = command;
module.exports.operation = operation

/**
 * Get command line flag value
 * @example
 * // return sample.md
 * // > nodemodule.js --filename sample.md
 * // OR
 * // > nodemodule.js -f sample.md
 * get('filename', 'f');
 * @param {string} longName - full name for the flag
 * @param {string} shortName - short name for the flga
 * @return {string} flag value
 */
function get(longName, shortName) {
  return options[shortName] || options[longName];
}
module.exports.get = get;

/**
 * Check if flag is specify
 * @example
 * // return true
 * // > nodemodule.js --filename sample.md -d ./
 * hasKey('filename');
 * // return false
 * hasKey('directory');
 * @param {string} key - flag name
 * @return {boolean} - true when flag is found.
 */
function hasKey(key) {
  return get(key) !== undefined;
}
module.exports.hasKey = hasKey

/**
 * Get value for flags directory (or -d).
 * @return {string} - value for directory flag
 */
module.exports.getDirectory = function() {
  return get('directory', 'd') || '.';
}

/**
 * Check if module is running in debug mode
 * @return {boolean} true when module is running in debug mode
 */
module.exports.debugMode = function() {
  const devMode = ['init', 'dev', 'debug', 'map', 'data'].some(function(x) {
    return process.argv[2] === x;
  });
  return devMode || hasKey('debug');
}

/**
 * Set defaul flag value
 * @param {string} key - flag to set
 * @param {boolean|string|undefined} [value=true] - flag's value
 * @return {void}
 */
module.exports.setDefault = function(key, value) {
  value = value || value === undefined;
  let flag = `--${key}=${value}`;
  if (typeof value === 'boolean') {
    flag = `--${value ? '' : 'no'}${key}`;
  }
  process.argv[process.argv.length] = flag;
  reload();
}

/**
 * Reload all the args.
 * @return {void}
 */
function reload() {
  let options = minimist(process.argv.slice(2));
  module.exports.options = options;
  module.exports.command = process.argv[2];
  module.exports.operation = process.argv[3];
  for (let key in options) {
    if (options[key] === true && key.startsWith('no')) {
      delete options[key];
      options[key.substr(2)] = false;
    }
  }
}

module.exports.reload = reload;
