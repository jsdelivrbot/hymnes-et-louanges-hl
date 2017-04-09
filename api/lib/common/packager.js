const log = require('./log');
const fs = require('fs');
const ejs = require('ejs');
const fileHandler = require('./fileHandler');


/**
 * Recursive call to find all files in a path.
 * @param {string} dir - valid directory path
 * @param {Array<string>} filesRecursive - list of file name
 * @return {Array<string>} - all the files in a directory
 */
function getFiles(dir, filesRecursive){
  filesRecursive = filesRecursive || [];
  const files = fs.readdirSync(dir);
  for (const i in files){
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()){
        getFiles(name, filesRecursive);
    } else {
        filesRecursive.push(name);
    }
  }
  return filesRecursive;
}
module.exports.getFiles = getFiles;

/**
 * @param {!string} directory - a valid path
 * @return {Array<string>} - A list of javascript filenames
 */
function getJsFiles(directory) {
  return getFiles(directory).filter(f => {
    return f.match('.js$') == '.js';
  });
}
module.exports.getJsFiles = getJsFiles;

/**
 * Get all nodejs module required under the given directory
 * @param {string} dirname - directory to investigate
 * @return {Array<string>} - imported npm module list
 */
function getImportedPackage(dirname) {
  const jsFiles = getJsFiles(dirname);
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
}
module.exports.getImportedPackage = getImportedPackage;


/**
 * Update the content of package.json
 * @param {string} dirname - directory to manage
 * @return {Object} - package info
 */
function getPackage(dirname) {
  const filename = dirname + '/package.json';
  let pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
  pkg.year = new Date().getFullYear();
  return pkg;
}
module.exports.getPackage = getPackage;
/**
 * Update the content of package.json
 * @param {string} dirname - directory to update
 * @return {void}
 */
function updateJson(dirname) {
  const libs = getImportedPackage(dirname);
  const filename = dirname + '/package.json';
  let pkg = getPackage(dirname);
  pkg.devDependencies = pkg.devDependencies || {};
  libs.forEach(function(lib) {
    pkg.devDependencies[lib] = pkg.devDependencies[lib] || 'latest';
  });
  pkg = JSON.stringify(pkg, null, 2);
  fs.writeFile(filename, pkg, function() {
    log.info('updated %s', filename);
  });
}
module.exports.updateJson = updateJson;

/**
 * Show README info for the current package
 * @param {string} dirname - directory to manage
 * @param {string} filename - template file to read
 * @param {boolean} [writeFile=true] - whether to write file in the current
 *   directory;
 * @param {string} additionalText - text to add a readme file.
 * @return {void}
 */
function describe(dirname, filename, writeFile, additionalText) {
  let pkg = getPackage(dirname);
  pkg.text = additionalText;
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
}
module.exports.describe = describe;

/**
 * Show license info for the current package
 * @param {string} dirname - directory to update
 * @return {void}
 */
function license(dirname) {
  describe(dirname, 'LICENSE', true);
}
module.exports.license = license;

/**
 * @param {!{
 *  command: string,
 *  operation: string,
 *  options: !Object
 * }} args - lib/args object with command line flags.
 * @return {void}
 */
module.exports.cli = function(args) {
  if (args.command === 'package') {
    switch(args.operation) {
      case 'license':
        license(args.getDirectory());
        break;

      case 'describe':
        describe(args.getDirectory(), 'README.md', true,
            args.options.text);
        break;

      case 'overview':
        describe(args.getDirectory(), 'README.md', false,
            args.options.text);
        break;

      case 'update':
        updateJson(args.getDirectory());
        break;

      default:
        log.error('Missing operation');
    }
  }
}
