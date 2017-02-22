(function() {
  /**
   * @module
   */

  const easyimg = require('easyimage');
  const fs = require('fs');
  const log = require('./log');
  const time = require('./time');
  const config = require('./config');
  const db = require('./database');
  const constants = require('./constants');
  const exporter = require('./exports');


  exporter.publicize(module, {

    /**
     * Send HTTP to request url.
     * @param {!{send: Function}} res - HTTP response
     * @param {string} status - status for response
     * @param {Object} msg - response body
     * @param {boolean} trace - true to log response
     * @return {void}
     */
    respond(res, status, msg, trace){
      db.respond(res, status, msg, trace);
    },


    /**
     * Sample get 
     * @param {Object} req - HTTP Request
     * @param {!{send: Function}} res - HTTP Response
     * @return {void}
     */
    sample(req, res){
      this.respond(res, {
        success: true,
        params: req.params
      });
    },


    /**
     * Ensure that the session is still active.
     * @param {string} stamp - timestamp or datestring
     * @return {boolean} - true if session is less than hours old
     */
    IsValidSession(stamp){
      return ((2 * 60 * 60 * 1000) - time.difference(stamp) > 0);
    },

    /**
     * Check to see if the input is a valid email
     * @param {string} email - email to verify
     * @return {string} - true if input match the email regex
     */
    IsEmail(email){
      return constants.EMAIL_FILTER.test(email);
    },


    /**
     * Create a new case insentive regex, can be use to compare strings.
     * @return {Regex} - case insensitive Regex
     */
    caseIns(){
      return new RegExp(this, 'i');
    },


    /**
     * Capitalize the first letter, and lower the remaining characters.
     * @return {string} - First letter capitalize and remaining text
     * lowercased.
     */
    capFirst(){
      return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    },

    /**
     * String formatter
     * @example
     * // returns Hello world
     * this.formatString(Hello %s, world)
     * @returns {string} - a formatted string
     */
    formatString() {
      let line = arguments[0];
      for (let i = 1; i < arguments.length; i++) {
        line = line.replace('%s', arguments[i]);
      }
      return line;
    },


    /**
     * Verify if the provided has the extension of an image.
     * @param {string} file - filename to verify
     * @return {boolean} - true if file is an image
     */
    isImage(file){
      const exts = ['.png', '.jpg', '.gif'];
      file = file.toLowerCase();
      return exts.some(function(ext) {
        return file.indexOf(ext) === (file.length - ext.length);
      });
    },


    /**
     * Find the extension of a given file.
     * @param {string} file - name of the file to find an extension for.
     * @return {string|boolean} - The extension if found, otherwise false.
     */
    getExtension(file){
      const index = file.lastIndexOf('.');
      if (index > 0)
        return file.substr(index + 1);
      return false;
    },


    /**
     * Classify files as an image of other extension.
     * @param {string} file - name of the file to classify
     * @return {{
     *  ext: string,
     *  thumb: string
     * }} - classification info
     */
    getFileType(file){
      if (this.isImage(file)){
        return {
          ext: 'image',
          thumb: 'thumb/' + file
        };
      }
      const ext = this.getExtension(file);
      if (ext){
        return {
          ext: ext,
          thumb: 'extensions/' + constants.EXTENSIONS[ext]
        };
      } 
      return {
        ext: 'other',
        thumb: 'extensions/other.png'
      };
    },


    /**
     * Generates a thumbnail file.
     * @param {string} orig - filepath for the original image
     * @param {string} dest - where to save the thumbnail
     * @param {string} name - filename for the thumbnail
     * @param {string} size - width for the new image
     * @return {Promise} - resolved promise
     */
    createThumbnail(orig, dest, name, size){
      return new Promise((resolve) => {
      size = size || 256;
      easyimg.info(orig).then(file => {
        easyimg.thumbnail({
          src: orig,
          dst: dest + name,
          width: file.width > size ? size: file.width,
        }).then(img => {
          log.info('Thumb created for', name, img);
          resolve();
        });
      });
      });
    },


    /**
     * Generates thumbnail for profile picture.
     * @param {string} filepath - path for the image to create a thumbnail for
     * @param {string} name - name of the thumbnail email
     * @param {string} [profile=profile] - path for the profile pictures
     * @return {Promise} - resolved on success otherwise reject
     */
    createProfileThumb(filepath, name, profile){
      return new Promise((resolve, reject) => {
        profile = profile || 'profile';
        if (this.isImage(filepath)){
          const destination = config.files + profile + '/thumb/';
          this.createThumbnail(filepath, destination, name , 256, stats => {
            resolve(stats);
          });
        }
        else {
          reject();
        }
      });
    },


    /**
     * Upload files to locally.
     * @param {string} name - name to save the new file.
     * @param {string} orig - filename for the original file
     * @param {string} dest - filename for the new file
     * @return {Promise} - resolved on success otherwise reject
     */
    uploadAndCreateFiles(name, orig, dest){
      return new Promise((resolve, reject) => {
        fs.exists(orig, exists => {
          if (exists){
            easyimg.info(orig).then(file => {
              easyimg.thumbnail({
                src: orig,
                dst: dest + '/thumb/' + name,
                width: file.width > 256 ? 256: file.width,
              })
              .then(img => log.info('Thumb created for', name, img));

              let height = file.height;
              if (file.width > 768)
                height = (file.height * (768 / file.width));
              easyimg.resize({
                src: orig,
                dst: dest + '/preview/' + name,
                width: file.width > 768 ? 768: file.width,
                height: height
              })
              .then(img => log.info('Preview created for', name, img));

              easyimg.resize({
                src: orig,
                dst: dest + '/full/' + name,
                width: file.width,
                height: file.height
              })
              .then(img => {
                log.info('Full created for', name, img);
                fs.unlink(orig, function(err) {
                  if (!err){
                    log.debug('File deleted successfully!');
                    resolve();
                  } 
                  else {
                    reject();
                  }
                });
              });
            });
          }
          else {
            log.info(orig + ' path', 'does not', 'exists');
          }
        });
      });
    },


    /**
     * Pagination helper.
     * @param {number} current - index for the current page
     * @param {number} slice - how many item per page
     * @param {number} total - number of item in the list to paginate
     * @param {number} size - len of the array
     * @return {Array<string>} page indexes to jump to.
     */
    getPages(current, slice, total, size){
      size--;
      const max = Math.ceil(total / slice);
      if (max < size)
        size = max;
      let end = current + Math.ceil(size/2);
      let start = end - size;
      if (start < 1){
        end = end - start;
        start = 1;
      }
      if (end > max)
        end = max;
      if (start < 1)
        start = 1;  

      let result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },

    /**
     * Check if the extension of two files are the same
     * @param {string} filename - name of the new file
     * @param {string} orig - name of the old (original) file
     * @return {string} - filename with the original extension
     */
    verifyExtension(filename, orig){
      filename = filename.toLowerCase();
      orig = orig.toLowerCase();
      const index = orig.lastIndexOf('.');
      if (index < 0)
        return filename;
      const ext = orig.substr(index);
      if (ext.length < 1 || filename.indexOf(ext) > -1)
        return filename;
      return filename + ext;
    },


    /**
     * Automatically add s to plural text if necessary.
     * @param {string} text - string to plurialize
     * @param {nubme} len - how many item
     * @param {string} [plural=s] - plural form
     * @return {string} - plurialize text when the given length is different
     *  than 1
     */
    plurialize(text, len, plural) {
      if (len && len !== 0) {
        return text + (plural || 's');
      }
      return text;
    },


    /**
     * Defaul callback function.
     * @param {string} err - error to handle
     * @return {void}
     */
    responseHandler(err){
      if (err)
        log.error(err);
    },


    /**
     * Show partial results and give indexes for jump to next results.
     * @param {Array<Object>} arr - list to paginate
     * @param {number} page - page number to show
     * @param {number} slice - maximum of number per page
     * @param {boolean} [reverse=true] - True to show latest item first
     * @param {boolean} [hidePages=false] - True to show inner page numbers
     * @return {{
     *  data: Arrray<Object>,
     *  start: number,
     *  end: number,
     *  page: number,
     *  prev: number,
     *  next: number,
     *  last: number,
     *  pages: Array<number>
     * }} - paginatino info
     */
    paginate(arr, page, slice, reverse, hidePages){
      reverse = reverse || true;
      hidePages = hidePages || false;
      page = parseInt(page || constants.PAGE);
      slice = parseInt(slice || constants.SLICE);
      if (page < 1)
        page = 1;
      if (slice < -1)
        slice = 10;
      if (slice > 25){
        slice = 25;
      }
      constants.PAGE = page;
      constants.SLICE = slice;

      if (arr){
        if (reverse === true)
          arr = arr.reverse();
      }
      else
        arr = [];
      const count = arr.length;
      let start = 1 + ((page-1) * slice);
      let end = slice + ((page-1) * slice);

      arr = arr.slice(start-1, end);
      if (count < end)
        arr = arr.slice(0, count % slice);

      const prev = page > 1 ? (page - 1): false;
      const next = count > end ? (page + 1): false;
      start = count > 0 ? start: 0;
      end = count > end ? end: count;
      const result = {
        data: arr,
        start: start,
        end: end,
        next: next,
        prev: prev,
        count: count
      };
      if (hidePages) {
        result.slice = slice;
        return result;
      }
      result.page = page;
      result.last = Math.ceil(count / slice);
      result.pages = this.getPages(page, slice, count, 7);
      return result;
    },


    /**
     * Show the first object of an array.
     * @param {Array<Object>} arr - list to peak into.
     * @param {number} limit - maximum number of item to show
     * @return {{
     *  count: number,
     *  arr: Array<Object>
     * }} - first few element in an array
     */
    peak(arr, limit){
      limit = parseInt(limit || 5);
      arr = arr ? arr.reverse(): [];
      const count = arr.length;
      limit = count < limit ? count: limit;
      return {
        count: count,
        arr: arr.slice(0, limit)
      };
    },


    /**
     * Simplify numbers into human readable formats.
     * @param {number} num - number to shorten
     * @param {boolean} plus - whether to show plus fine for number greater
     *  than 99
     * @return {number} - human readable number
     */
    getNumberIndicator(num, plus){
      if (num === undefined)
        return '';
      plus = plus || false;
      if (plus === true && num >= 100)
        return '99+';

      if (num > 100000000000)
        return parseInt(num / 1000000000) + 'B';
      if (num > 1000000000)
        return (Math.round(num / 100000000) / 10) + 'B';

      if (num > 100000000)
        return parseInt(num / 1000000) + 'M';
      if (num > 1000000)
        return (Math.round(num / 100000) / 10) + 'M';

      if (num > 100000)
        return parseInt(num / 1000) + 'K';
      if (num > 1000)
        return (Math.round(num / 100) / 10) + 'K';
      else
        return num;
    },


    /**
     * Return path to profile picture
     * @param {string} filename - name of the picture file
     * @return {string} - path to profile picture
     */
    getProfilePicture(filename) {
      if (filename) {
        return '/profile/thumb/' + filename;
      }
      return '/img/placeholder.user.png';
    },


    send(data, res, lastMod) {
      if (data) {
        data.success = true;
      }
      data = data || {success: false};
      if (lastMod) {
        res.setHeader('Last-Modified', lastMod);
        res.setHeader('Date', new Date());
      }
      res.send(data);
    },

    /**
     * @param {string} key - attribute to OR
     * @param {Array<string>} values - Possible match for key
     * @return {!{$or: Array<Object>}} - Mongo $or expression
     */
    mongoOrArray(key, values) {
      var expression = {$or: []};
      values.forEach(function(val) {
        var orExp = {};
        orExp[key] = val;
        expression.$or.push(orExp);
      });
      return expression;
    },

    retry(fn, count=2) {
      let tries = 0;
      if (count > 0) {
        try {
          ++tries;
          fn();
        }
        catch(e) {
          log.debug(e);
          tries += this.retry(fn, --count);
        }
      }
      return tries;
    },

    resolve(err, res, body) {
      if (err) {
        res.statusCode = 500;
        res.send({success: false});
      }
      else {
        res.send(Object.assign(body || {}, {success: true}));
      }
    },

    reject(error, rejectFn) {
      log.error(error);
      rejectFn(error);
    },
  });
  
  String.prototype.caseIns = module.exports.caseIns;
  String.prototype.capFirst = module.exports.capFirst;
})();
