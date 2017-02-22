(function () {

  /**
   * Get all the required fields for the HTTP request from page
   * @return {!{
   *  success: boolean,
   *  message: string
   * }} - a search params message when the retreival is successful.
   */
  function getAllFields() {
    let message = '';
    for (let i = 0; i < window.appInputs.length; i++) {
      const key = window.appInputs[i];
      const input = document.querySelector('#' + key);
      if (!input.value) {
        return {
          success: false,
          message: key
        };
      }
      message += '&' + key + '=' + input.value;
    }
    return {
      success: true,
      message: message
    };
  }

  const btn = document.querySelector('button');
  if (btn) {
    btn.onclick = function() {
      const fields = getAllFields();
      if (fields.success) {
        window.location.href += fields.message;
      }
    };
  }
})();
