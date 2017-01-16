(function() {
  /**
   * @module
   * @desc Export all function or constant in a module that start with a
   * alpha character
   */
  const wsModule = {
    publicize(lib, library) {
      if (typeof library !== 'object') {
        lib.exports = library;
        return;
      }
      for (const key in library) {
        if (key.match(/^[a-zA-Z]/g)) {
          if (!lib.exports[key]) {
            lib.exports[key] = library[key];
          }
        }
      }
    }
  };

  wsModule.publicize(module, wsModule);
})();
