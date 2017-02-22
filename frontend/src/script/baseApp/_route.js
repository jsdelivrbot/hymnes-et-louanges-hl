(function (wquery) {

  /**
   * Re-trigger the load event.
   */
  function reloadScript(){
    dispatchEvent(new Event('load'));
  }


  /**
   * Provide information about application current's route.
   * @return {Array}
   */
  function getRouteArgs(){
    var path = window.location.href.replace(wquery.base, '');
    path = path.split('/');
    if (path.length > 0 && path[path.length - 1] === ""){
      delete path[path.length - 1];
    }
    return path;
  }


  /**
   * Helper function to get html content for the a route within the app.
   * @param {string} filename - route to lookup
   * @param {Function} cb - callback function
   */
  function readPartialFile(filename, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'views/partials/' + filename + '.html', true);
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        cb(xhr.responseText, true);
      }
    }
    xhr.send(null);
  }


  /**
   * Update the url in the browser.
   */
  function updateUrl(route) {
    if (app.getRouteArgs().join('/') !== route) {
      window.history.pushState({}, null, wquery.base + route);
    }
  }


  /**
   * @param {string} route - route to lookup
   * @param {Function} cb - callback function
   */
  function setRoute(originalRoute, cb) {
    var route = app.fileRouter(originalRoute);
    if (! route) {
      return;
    }
    readPartialFile(route, function(data, success){
      var pageview = '.pageview';
      wquery.empty(pageview);
      wquery.append(pageview, data); 
      if (success) {
        var path = originalRoute.replace('-', '/');
        updateUrl(path);
      }
      getRouteData(route);
      if (cb !== undefined) {
        cb();
      }
    });
  }


  function correctRoute(route, first) {
    var args = route.split('-');
    if (args.length === 2) {
      if (first) {
        return args[0];
      }
      if (args[1] !== 'new') {
        args[1] = 'new';
        return args.join('-');
      }
    }
    return route;
  }


  /**
   * Perform additional steps to finalize route.
   * @param {string} route
   */
  function getRouteData(route) {
    var action = app.routeActions[route];
    if (action !== undefined) {
      setTitle(action.title);
      if (typeof action.fn === 'function') {
        reloadScript();
        action.fn(); 
      }
    }
  }


  /**
   * Check to see if we trying to edit a page.
   * @return {string|Boolean} 
   */
  function isEdit() {
    var args = getRouteArgs();
    if (args.length === 2 && args[1] !== 'new'){
      return args[1];
    }
    return false;
  }


  /**
   * Update the title for the current view.
   * @param {string} title
   */
  function setTitle(title) {
    //TODO(wspecs) - push page title
  }

  app.reloadScript = reloadScript;
  app.isEdit = isEdit;
  app.setTitle = setTitle,
  app.getRouteArgs = getRouteArgs;
  app.setRoute = setRoute;
  app.updateUrl = updateUrl;
})(_WQ);
