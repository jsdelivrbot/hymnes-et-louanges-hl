(function() {

  /**
   * @module
   */
  const log = require('./log');
  const fs = require('fs');
  const ejs = require('ejs');
  const exporter = require('./exports');
  const fileHandler = require('./fileHandler');


  exporter.publicize(module, {

    /**
     * Recursive call to find all files in a path.
     * @param {string} dir - valid directory path
     * @param {Array<string>} filesRecursive - list of file name
     * @return {Array<string>} - all the files in a directory
     */
    getFiles (dir, filesRecursive){
      filesRecursive = filesRecursive || [];
      const files = fs.readdirSync(dir);
      for (const i in files){
        const name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            this.getFiles(name, filesRecursive);
        } else {
            filesRecursive.push(name);
        }
      }
      return filesRecursive;
    },

    /**
     * @param {!string} directory - a valid path
     * @return {Array<string>} - A list of javascript filenames
     */
    getJsFiles(directory) {
      return this.getFiles(directory).filter(f => {
        return f.match('.js$') == '.js';
      });
    },

    /**
     * Get all nodejs module required under the given directory
     * @param {string} dirname - directory to investigate
     * @return {Array<string>} - imported npm module list
     */
    getImportedPackage(dirname) {
      const jsFiles = this.getJsFiles(dirname);
      let lib = [];
      jsFiles.forEach(function(file) {
        const content = fs.readFileSync(file,'utf8').split('\n');
        (content || []).forEach(function(line) {
          const match = line.match(/require\(.*\)/g);
          if (match) {
            const module = match[0].replace(/require|\(|\)|'/g, '');
            if (module[0] !== '.' && module.indexOf('+') < 0) {
              lib.push(module);
            }
          }
        });
      });
      // Return unique array
      return lib.filter(function(x, i) {return lib.indexOf(x) === i;});
    },


    /**
     * Update the content of package.json
     * @param {string} dirname - directory to manage
     * @return {Object} - package info
     */
    getPackage(dirname) {
      const filename = dirname + '/package.json';
      let pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
      pkg.year = new Date().getFullYear();
      return pkg;
    },

    /**
     * Update the content of package.json
     * @param {string} dirname - directory to update
     * @return {void}
     */
    updateJson(dirname) {
      const libs = this.getImportedPackage(dirname);
      const filename = dirname + '/package.json';
      let pkg = this.getPackage(dirname);
      pkg.devDependencies = pkg.devDependencies || {};
      libs.forEach(function(lib) {
        pkg.devDependencies[lib] = pkg.devDependencies[lib] || 'latest';
      });
      pkg = JSON.stringify(pkg, null, 2);
      fs.writeFile(filename, pkg, function() {
        log.info('updated %s', filename);
      });
    },

    /**
     * Show README info for the current package
     * @param {string} dirname - directory to manage
     * @param {string} filename - template file to read
     * @param {boolean} [writeFile=true] - whether to write file in the current
     *   directory;
     * @return {void}
     */
    describe(dirname, filename, writeFile) {
      let pkg = this.getPackage(dirname);
      filename = filename || 'README.md';
      const template = fileHandler.getTemplate(filename);
      const content = ejs.render(template, pkg);
      if (writeFile || writeFile === undefined) {
        fs.writeFile(filename, content, function() {
          log.info('updated %s', filename);
        });
      }
      else {
        log.print(content);
      }
    },

    /**
     * Show license info for the current package
     * @param {string} dirname - directory to update
     * @return {void}
     */
    license(dirname) {
      this.describe(dirname, 'LICENSE', true);
    },

    /**
     * @param {!{
     *  command: string,
     *  operation: string,
     *  options: !Object
     * }} args - lib/args object with command line flags.
     * @return {void}
     */
    cli(args) {
      if (args.command === 'package') {
        switch(args.operation) {
          case 'license':
            this.license(args.getDirectory());
            break;

          case 'describe':
            this.describe(args.getDirectory());
            break;

          case 'overview':
            this.describe(args.getDirectory(), 'README.md', false);
            break;

          case 'update':
            this.updateJson(args.getDirectory());
            break;

          default:
            log.error('Missing operation');
        }
      }
    }
  });
})();
