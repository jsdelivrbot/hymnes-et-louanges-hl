(function() {
  /**
   * @module
   */

  const fs = require('fs');
  const log = require('./log');
  const child = require('child_process').spawn;
  const editor = process.env.EDITOR || 'vi';
  const exporter = require('./exports');
  const MARKERS = ['--', '#', '=', '](', '*'];

  exporter.publicize(module, {

    /**
     * @param {string} filename - name for the template file.
     * @param {string} extension - template file extension
     * @return {string} - template content
     */
    getTemplate(filename, extension) {
      const template = __dirname + '/../template/';
      switch(extension) {
        case 'js':
          return fs.readFileSync(template + 'sample.js', 'utf8');

        case 'test':
          return fs.readFileSync(template + 'test.txt', 'utf8');

        default:
          return fs.readFileSync(template + filename, 'utf8');
      }
    },

    /**
     * @param {string} filename - file to open
     * @return {void}
     */
    open(filename) {
      child(editor, [filename], {
        stdio: 'inherit'
      });
    },

    /**
     * @param {string} filename - file to normaline
     * @param {number} size - Maximum number of characters per line
     * @return {string} - file content with correct lint breaks
     */
    setBreakLine(filename, size) {
      const lines = fs.readFileSync(filename, 'utf8').split('\n');
      let index = -1;
      let holder = [];
      let append = false;

      lines.forEach(line => {
        const marked = !line || MARKERS.some(x => line.indexOf(x) > -1);
        if (marked) append = false;
        if (!append) {
          holder[++index] = line;
        }
        else {
          holder[index] += ' ' + line;
        }
        if (line.length >= size) append = true;
      });

      const content = holder.reduce((res, item) => {
        res += this.breakString(item, size);
        return res;
      }, '');

      fs.writeFile(filename, content, 'utf8', err => {
        if (!err) {
          log.info('mdified file %s', filename);
        }
      });
    },

    /**
     * @param {string} str - line to break
     * @param {number} size - Maximum number of characters per line
     * @return {string} - text with correct line break
     */
    breakString(str, size) {
      if (str.length < size) return str + '\n';
      let breakPoint = size;
      let index = str.length;
      for (const x of Array.from(Array(7), (x, i) => (i + 1) * 3)) {
        if (index >= size) {
          breakPoint = size - x;
          const spaceIdx = str.substr(breakPoint).indexOf(' ');
          index = spaceIdx === -1 ? str.length : breakPoint + spaceIdx;
        }
        else break;
      }
      return str.substr(0, index) + '\n' +
        this.breakString(str.substr(index).trim(), size);
    },

    /**
     * Modify file by setting maximum number of character per line
     * automatically.
     * @example
     * // rewrite file.md and file.txt with line length set to 80 at maximum
     * this.setMaxWidth(['file.md', 'file.txt', 80])
     * @param {Array<string>} args - list of file to modify
     * @return {void}
     */
    setMaxWidth(...args) {
      const isNum = (x) => !isNaN(parseInt(x, 10)) && x.indexOf('.') === -1;
      const files = args.filter(x => !isNum(x));
      let num = args.find(x => isNum(x));
      num = parseInt(num, 10) || 80;
      files.forEach(file => {
        const valid = ['.md', '.txt'].some(x => file.indexOf(x) > -1);
        if (valid) {
          fs.stat(file, (err, stat) => {
            if (err) log.error(err);
            else if (!stat.isFile()) {
              log.error('%s is not a file', file);
            }
            else {
              this.setBreakLine(file, num);
            }
          });
        }
      });
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
      if (args.command === 'mdify') {
        if (args.operation) {
          this.setMaxWidth(...args.options._.slice(1));
        }
        else {
          log.error('Missing filename');
        }
      }
    }
  });
})();
