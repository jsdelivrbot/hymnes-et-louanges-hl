(function(){
  var $ = document.querySelectorAll.bind(document);
  var $$ = document.querySelector.bind(document);
  var base = $$('base').href;

  function empty(selector){
    var nodes = $(selector);
    for (var index = 0; index < nodes.length; index++) {
      nodes[index].innerHTML = '';
    }
  }

  function append(selector, append, type){
    var wrapper= document.createElement('div');
    wrapper.innerHTML= append;
    if (type){
      wrapper.innerHTML = '<' + type + '>' + append + '</' + type + '>';
    }
    $$(selector).appendChild(wrapper.firstChild);
  }

  function html(selector, html){
    var nodes = $(selector);
    for (var index = 0; index < nodes.length; index++) {
      nodes[index].innerHTML = html;
    }
  }

  function animate(selector, style){
    var nodes = $(selector);
    for (var index = 0; index < nodes.length; index++) {
      nodes[index].style.animation = style;
    }
  }

  function style(selector, style, value){
    var nodes = $(selector);
    for (var index = 0; index < nodes.length; index++) {
      nodes[index].style[style] = value;
    }
  }

  function hide(selector){
    var nodes = $(selector);
    for (var index = 0; index < nodes.length; index++){
      nodes[index].style.display = 'none';
    }
  }

  function show(selector, inline){
    inline = inline || false;
    var nodes = $(selector);
    for (var index = 0; index < nodes.length; index++){
      nodes[index].style.display = inline ? 'inline' : 'block';
    }
  }

  function setCookie(cname, cvalue, exdays) {
    cvalue = JSON.stringify(cvalue);
    exdays = exdays || 7;
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/;"; 
  }

  function getCookie(cname, initial) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) ===' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return JSON.parse(c.substring(name.length));
      }
    }
    return initial || "";
  }

  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    }
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
  }

  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    }
    else if (!hasClass(el, className)) {
      el.className += " " + className;
    }
  }

  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    }
    else if (hasClass(el, className)) {
      var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
      el.className=el.className.replace(reg, ' ');
    }
  }

  window._WQ = {
    empty : empty,
    append : append,
    style : style,
    hide : hide,
    show : show,
    animate : animate,
    html : html,
    getCookie : getCookie,
    setCookie : setCookie,
    base : base,
    removeClass: removeClass,
    addClass: addClass,
    hasClass: hasClass,
    $ : $,
    $$ : $$
  };

})();
