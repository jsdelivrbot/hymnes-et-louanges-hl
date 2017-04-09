const args = require('./args');
const chalk = require('chalk');

const INFO = chalk.white;
const DATA = chalk.cyan;
const ERROR = chalk.magenta;
const WARN = chalk.yellow;


/**
 * Generic function to write to the console
 * @param {Array<Object>} texts - argument for logging
 * @param {!Function} writer - chalk writer
 * @param {string} context - log category (e.g INFO, ERROR)
 * @param {string} line - additional text to log.
 * @return {void}
 */
function write(texts, writer, context, line){
  line = line || writer(texts[0]);
  if (typeof texts[0] === 'object' || Array.isArray(texts[0])) {
    data(texts[0]);
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
}
module.exports.write = write;

/**
 * Handles all default logs.
 * @return {void}
 */

module.exports.print = function() {
  write(arguments, INFO);
};

/**
 * Prepend INFO to logs
 * @return {void}
 */
module.exports.info = function() {
  write(arguments, INFO, chalk.green('INFO: '));
};


/**
 * Handles all default logs.
 * @return {void}
 */
module.exports.warn = function() {
  write(arguments, WARN, chalk.yellow('WARNING: '));
};


/**
 * Handles all JSON objects.
 * @return {void}
 */
function data() {
  for (let index = 0; index < arguments.length; index++) {
    console.log(DATA(JSON.stringify(arguments[index], null, 2)));
  }
}
module.exports.data = data;

/**
 * Handles all error logs.
 * @return {void}
 */
module.exports.error = function() {
  write(arguments, ERROR, chalk.red('ERROR: '));
};


/**
 * Handles all debugging logs--only print in development mode.
 * @return {void}
 */
module.exports.debug = function() {
  if (args.debugMode()) {
    write(arguments, INFO, chalk.magenta('DEBUG: '));
  }
};
