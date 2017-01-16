(function() {
  /**
   * @module
   * @desc Nofities recipients of changes.
   */

  const fs = require('fs');
  const htmlToText = require('html-to-text');
  const mail = require('./mail');
  const log = require('./log');
  const exporter = require('./exports');


  exporter.publicize(module, {

    /**
     * Read an email template.
     * @param {string} name - filename to read
     * @param {string} extension - extensio of the file name to read
     * @return {string} - The template file
     */
    readTemplate(name, extension) {
      try {
        extension = '.' + (extension || 'html');
        const file = name + extension;
        return fs.readFileSync('./template/' + file, 'utf8');
      }
      catch (e) {
        return null;
      }
    },


    /**
     * Match all {{patterns}} in the given text with their corresponding values.
     * @param {string} text - A string to modify
     * @param {Object} values - Dictionary to replace template values.
     * @return {string} The parsed template with correct values
     */
    replaceValues(text, values) {
      const keys = Object.keys(values);
      keys.forEach(function(key) {
        const original = '{{' + key + '}}';
        const replacement = values[key];
        text = text.replace(new RegExp(original, 'g'), replacement);
      });
      return text;
    },


    /**
     * Notify user when new accounts are created.
     * @param {string} email - recipient's email.
     * @param {string} link - confirmation link.
     * @param {string} first - user's first name
     * @param {string} from - sender for the email
     * @return {void}
     */
    sendNewAccountEmail(email, link, first, from){
      let content = this.readTemplate('email-verify');
      if (content) {
        content = this.replaceValues(content, {confirm_url: link, first: first});
      }
      const text = htmlToText.fromString(content);
      const subject = 'Confirm Your email';
      mail.sendEmail(email, subject, text, content, from);
      log.info('Send new email to %s', first);
    }
 });
})();
