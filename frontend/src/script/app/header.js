(function(wquery) {
  'use strict';

  var appbar, search, menu, sidebar, search_input;

  function openSearchBox() {
    wquery.addClass(appbar, 'search');
    search_input.focus();
  }


  function closeSearchBox() {
    wquery.removeClass(appbar, 'search');
  }

  function openSidebar() {
    wquery.addClass(sidebar, 'open');
    app.disableScroll();
  }


  function closeSidebar() {
    wquery.removeClass(sidebar, 'open');
    app.enableScroll();
  }

  function getSearchInfo(e) {
    if (e.keyCode === 13) {
      var searchText = e.target.value;
      e.target.blur();
      e.target.input = '';
      window.location.href = wquery.base + 'search/' + searchText;
    }
  }


  function handleScroll() {
    var stick = document.body.scrollTop > 64;
    if (stick) {
      wquery.addClass(appbar, 'stick-top');
    }
    else if (document.body.scrollTop === 0) {
      wquery.removeClass(appbar, 'stick-top');
    }
  }

  function init() {
    appbar= wquery.$$('.appbar');
    search = wquery.$$('.appbar .search');
    if (search) {
      search.onclick = openSearchBox;
    }
    menu = wquery.$$('.appbar .menu');
    if (menu) {
      menu.onclick = openSidebar;
    }
    search_input = wquery.$$('.searchbox input');
    if (search_input) {
      search_input.onblur = closeSearchBox;
      search_input.onkeyup = getSearchInfo;
    }
    var search_action = wquery.$$('.search-action');
    if (search_action) {
      search_action.onclick = openSearchBox;
    }


    sidebar = wquery.$$('.sidebar');
    sidebar.onclick = closeSidebar;

    window.addEventListener('scroll', handleScroll);
  }

  init();
})(_WQ);
