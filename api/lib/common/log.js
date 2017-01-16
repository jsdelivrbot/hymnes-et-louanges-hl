(function() {
  /**
   * @module
   * @desc Handles all logs request for the application.
   */

  const exporter = require('./exports');
  const args = require('./args');
  const chalk = require('chalk');

  const INFO = chalk.white;
  const DATA = chalk.cyan;
  const ERROR = chalk.magenta;
  const WARN = chalk.yellow;


  exporter.publicize(module, {
    /**
     * Generic function to write to the console
     * @param {Array<Object>} texts - argument for logging
     * @param {!Function} writer - chalk writer
     * @param {string} context - log category (e.g INFO, ERROR)
     * @param {string} line - additional text to log.
     * @return {void}
     */
    write(texts, writer, context, line){
      line = line || writer(texts[0]);
      if (typeof texts[0] === 'object' || Array.isArray(texts[0])) {
        this.data(texts[0]);
        return;
      }
      context = context || '';
      let index = 1;
      for (;index < texts.length; index++) {
        if (line.indexOf('%s') === -1) {
          break;
        }
        line = line.replace('%s', writer.bold(texts[index]));
      }
      console.log(context + writer(line));
      for (;index < texts.length; index++) {
        console.log(context + writer(texts[index]));
      }
    },

    /**
     * Handles all default logs.
     * @return {void}
     */

    print() {
      this.write(arguments, INFO);
    },

    /**
     * Prepend INFO to logs
     * @return {void}
     */
    info() {
      this.write(arguments, INFO, chalk.green('INFO: '));
    },


    /**
     * Handles all default logs.
     * @return {void}
     */
    warn() {
      this.write(arguments, WARN, chalk.yellow('WARNING: '));
    },


    /**
     * Handles all JSON objects.
     * @return {void}
     */
    data() {
      for (let index = 0; index < arguments.length; index++) {
        console.log(DATA(JSON.stringify(arguments[index], null, 2)));
      }
    },


    /**
     * Handles all error logs.
     * @return {void}
     */
    error() {
      this.write(arguments, ERROR, chalk.red('ERROR: '));
    },


    /**
     * Handles all debugging logs--only print in development mode.
     * @return {void}
     */
    debug() {
      if (args.debugMode()) {
        this.write(arguments, INFO, chalk.magenta('DEBUG: '));
      }
    }
  });
})();
