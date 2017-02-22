(function () {
  /**
   * @module
   */
  const exporter = require('./exports');
  const minimist= require('minimist');


  exporter.publicize(module, {

    options: minimist(process.argv.slice(2)),

    command: process.argv[2],

    operation: process.argv[3],

    /**
     * Get command line flag value
     * @example
     * // return sample.md
     * // > nodemodule.js --filename sample.md
     * // OR
     * // > nodemodule.js -f sample.md
     * this.get('filename', 'f');
     * @param {string} longName - full name for the flag
     * @param {string} shortName - short name for the flga
     * @return {string} flag value
     */
    get(longName, shortName) {
      return this.options[shortName] || this.options[longName];
    },

    /**
     * Check if flag is specify
     * @example
     * // return true
     * // > nodemodule.js --filename sample.md -d ./
     * this.hasKey('filename');
     * // return false
     * this.hasKey('directory');
     * @param {string} key - flag name
     * @return {boolean} - true when flag is found.
     */
    hasKey(key) {
      return this.get(key) !== undefined;
    },

    /**
     * Get value for flags directory (or -d).
     * @return {string} - value for directory flag
     */
    getDirectory() {
      return this.get('directory', 'd') || '.';
    },

    /**
     * Check if module is running in debug mode
     * @return {boolean} true when module is running in debug mode
     */
    debugMode() {
      const devMode = ['init', 'dev', 'debug', 'map', 'data'].some(function(x) {
        return process.argv[2] === x;
      });
      return devMode || this.hasKey('debug');
    },

    /**
     * Set defaul flag value
     * @param {string} key - flag to set
     * @param {boolean|string|undefined} [value=true] - flag's value
     * @return {void}
     */
    setDefault(key, value) {
      value = value || value === undefined;
      let flag = `--${key}=${value}`;
      if (typeof value === 'boolean') {
        flag = `--${value ? '' : 'no'}${key}`;
      }
      process.argv[process.argv.length] = flag;
      this.reload();
    },

    /**
     * Reload all the args.
     * @return {void}
     */
    reload() {
      this.options = minimist(process.argv.slice(2));
      this.command = process.argv[2];
      this.operation = process.argv[3];
      for (let key in this.options) {
        if (this.options[key] === true && key.startsWith('no')) {
          delete this.options[key];
          this.options[key.substr(2)] = false;
        }
      }
    }
  });
})();
