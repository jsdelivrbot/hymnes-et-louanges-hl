module.exports = (() => {
  const fs = require('fs');
  const log = require('./log');
  const configPath = __dirname + '/../config.json';
  const authPath = (process.env.HOME || process.env.USERPROFILE) + '/.wsconfig';

  let config = {};
  try {
    // Attemp to read localconfig first
    config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  }
  catch (e) {
    // Fallback to ws-lib default config
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  try {
    // Attempts to read config file.
    const content = fs.readFileSync(config.wsConfigPath || authPath, 'utf8');
    content.split('\n').forEach(function(line) {
      const args = line.split(' ');
      if (args.length === 2) {
        config[args[0].replace(':', '')] = args[1];
      }
    });
    config.col_auth = config['api_scope_' + config.col];
  }
  catch (e) {
    log.warn('Could not read wsconfig');
  }
  return config;
})();
