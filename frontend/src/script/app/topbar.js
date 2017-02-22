(function(wquery) {
  'use strict';

  var topbar, search, menu, sidebar, search_input;

  function openSearchBox() {
    wquery.addClass(topbar, 'search');
    search_input.focus();
  }


  function closeSearchBox() {
    wquery.removeClass(topbar, 'search');
  }

  function openSidebar() {
    wquery.addClass(sidebar, 'open');
    wquery.addClass(wquery.$$('body'), 'stop-scrolling');
  }


  function closeSidebar() {
    wquery.removeClass(sidebar, 'open');
    wquery.removeClass(wquery.$$('body'), 'stop-scrolling');
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
      wquery.addClass(topbar, 'full');
    }
    else if (document.body.scrollTop === 0) {
      wquery.removeClass(topbar, 'full');
    }
  }

  function init() {
    topbar= wquery.$$('.topbar');
    search = wquery.$$('.topbar .search');
    if (search) {
      search.onclick = openSearchBox;
    }
    menu = wquery.$$('.topbar .menu');
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
