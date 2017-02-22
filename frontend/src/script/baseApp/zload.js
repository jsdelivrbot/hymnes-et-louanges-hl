(function(wquery){
  function load(){
    var route = app.getRouteArgs().join('-');
    app.setRoute(route || app.initialRoute);
  }

  document.addEventListener('DOMContentLoaded', load, false);
  window.onscroll = app.scrollHandler;
  window.onpopstate = function(e) {
    app.setRoute(app.getRouteArgs().join('-'));
  }
})(_WQ);
