(function() {
  /**
   * @module
   */

  const moment = require('moment');

  const exporter = require('./exports');


  exporter.publicize(module, {
    /**
     * Get timestamp.
     * @param {string} dateFormat - desired output format.
     * @return {string} - A UTC timestamp for now.
     */
    now(dateFormat){
      if (dateFormat) {
        return moment(moment().utc()).toString();
      }
      return moment.now();
    },


    /**
     * Get time elapsed from now.
     * @param {string} dateString - a timestamp or date formatted string.
     * @return {string} - human readable time elapsed
     */
    fromNow(dateString) {
      return moment(dateString).fromNow();
    },


    /**
     * Get difference between a past date and now.
     * @param {string} dateString - a timestamp or date formatted string.
     * @return {number} - the different from now for the given date in
     * milliseconds
     */
    difference(dateString) {
      return moment(moment().utc()).diff(moment(dateString));
    }
  });
})();
