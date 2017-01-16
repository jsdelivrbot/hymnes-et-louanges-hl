(function(app){
  /**
   * Make sure the user session is still valid.
   * @param {!{success: !boolean}} data
   */
  function checkStatus(data) {
    if (data.success === false && data.msg === -100) {
      app.logout();
    }
  }


  /**
   * @param {XMLHttpRequest} xhr
   * @param {Rquester~callback} cb
   */
  function responseHandler(xhr, cb) {
    if (xhr.readyState === 4 && typeof cb === 'function') {
      if (xhr.status === 200) {
        var header = xhr.getResponseHeader('Content-Type').toLowerCase();
        var json_header = 'application/json';
        if (header.indexOf(json_header) > -1) {
          var data = JSON.parse(xhr.responseText);
          checkStatus(data);
          cb(data);
        }
        else {
          cb(xhr.responseText);
        }
      } else {
        cb('');
      }
    }
  }
  app.responseHandler = responseHandler;


  function request(link, cb, json, includeKey, type){
    includeKey = includeKey || false;
    type = type || 'GET';
    json = json || null;
    var url = link;
   
    if (json === 'GET' && includeKey) {
      url += '/' + session.getId();
      json = null;
    }
    else if (json) {
      type = type === 'GET' ? 'POST' : type;
      if (typeof json === 'object' && includeKey) {
        var key = typeof includeKey === 'string' ? includeKey : 'key';
        json[key] = session.getId();
      }
      if (typeof json !== 'string') {
        json = JSON.stringify(json);
      }
    }

    var xhr = new XMLHttpRequest();
    xhr.open(type, url, true);
    if (type !== 'GET') {
      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    }
    xhr.onerror = function (e) {
      console.error('REQUEST ERROR!', xhr.statusText);
    };
    xhr.send(json);
    xhr.onloadend = function (e) {
      responseHandler(xhr, cb);
    };
  }


  app.getRequest = function(link, cb) {
    request(link, cb, 'GET', true);
  };

  app.upsertRequest = function(link, formData, editId, cb) {
    var type = 'POST';
    if (editId) {
      type = 'PUT';
      formData.id = editId;
    }
    request(link, cb, formData, 'auth', type);
  };


  window.request = request;

})(app);
