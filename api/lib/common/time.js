const moment = require('moment');


/**
 * Get timestamp.
 * @param {string} dateFormat - desired output format.
 * @return {string} - A UTC timestamp for now.
 */
module.exports.now = function(dateFormat){
  if (dateFormat) {
    return moment(moment().utc()).toString();
  }
  return moment.now();
};


/**
 * Get time elapsed from now.
 * @param {string} dateString - a timestamp or date formatted string.
 * @return {string} - human readable time elapsed
 */
module.exports.fromNow = function(dateString) {
  return moment(dateString).fromNow();
};


/**
 * Get difference between a past date and now.
 * @param {string} dateString - a timestamp or date formatted string.
 * @return {number} - the different from now for the given date in
 * milliseconds
 */
module.exports.difference = function(dateString) {
  return moment(moment().utc()).diff(moment(dateString));
};
