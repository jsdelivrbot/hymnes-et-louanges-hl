(function(wquery){
  app.store = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  app.get = function(key, defaultValue) {
    var value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return defaultValue || false;
  }
})(_WQ);
