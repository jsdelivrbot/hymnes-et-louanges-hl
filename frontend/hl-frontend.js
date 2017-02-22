(function() {
  /**
   * Main file for hl application.
   */
  const frontend = require('./main');
  const fs = require('fs');
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const router = require('./router');

  /**
   * Start web app.
   */
  frontend.start(config, router);
})();
