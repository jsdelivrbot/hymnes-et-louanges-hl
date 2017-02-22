(function() {
  /**
   * @module
   * @desc Handles all outgoing mail requests.
   */

  const nodemailer = require('nodemailer');
  const smtpTransport = require('nodemailer-smtp-transport');
  const log = require('./log');
  const time = require('./time');
  const exporter = require('./exports');
  const config = require('./config');


  /*
   * Mailer configuration
   */
  const transporter = nodemailer.createTransport(smtpTransport({
    host: config.wspecs_mailer_host,
    port: 465,
    secure: true,
    auth: {
      user: config.wspecs_mailer_scope,
      pass: config.wspecs_mailer_auth
    }
  }));


  exporter.publicize(module, {
    /**
     * Sends email to recipient.
     * @param {!string} to - recipient's email's address
     * @param {!string} subject - title for the email
     * @param {string} txt - email's textual content
     * @param {string} html - HTML formatted email string
     * @param {!string} from - sender
     * @return {void}
     */
    sendEmail(to, subject, txt, html, from){
      transporter.sendMail({
        from: from || config.wspecs_mailer_scope,
        to: to,
        subject: subject,
        text: txt,
        html: html
      }, err => {
        if (err)
          log.error(err);
        else
          log.info('Email sent to', to, time.now());
      });
    }
  });
})();
