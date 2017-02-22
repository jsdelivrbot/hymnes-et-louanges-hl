(function () {

  const userInput = document.querySelector('#Username');
  const passInput = document.querySelector('#Password');
  const statusElem = document.querySelector('.status');
  const form = document.querySelector('.form');

  function submit() {
    let message = {
      user: userInput.value,
      pass: btoa(passInput.value),
    };
    if (!message.user || !message.pass) {
      console.log('done');
    }
    else {
      statusElem.innerHTML = '';
      fetch(location.pathname, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        return response.json();
      }).then(json => {
        if (json.success) {
          form.hidden = true;
          statusElem.innerHTML = 'SUCCESS!!!';
          document.cookie = `access_token=${json.token}; ` +
            `Max-Age=${json.maxAge}; path=${json.path}`;
        }
        else {
          statusElem.innerHTML = 'FAIL';
        }
      });
    }
  }

  const btn = document.querySelector('button');
  if (btn) {
    btn.onclick = function() {
      submit();
    };
  }
})();
