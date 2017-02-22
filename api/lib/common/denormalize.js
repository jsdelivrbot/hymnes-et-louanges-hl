(function () {
  /**
   * @module
   * @desc Provide capability to udpate dependent object to speed GET request.
   */

  const time = require('./time');
  const db = require('./database');
  const exporter = require('./exports');

  exporter.publicize(module, {
    /**
     * Denormalize author depencies--update posts when author's info change.
     * @param {!{id: !string}} info - author's new information.
     * @return {void}
     */
    author(info) {
      const query = {'author.id': info.id};
      const selector = {_id: 0};
      const table = 'posts';
      db.findAll(table, query, selector).then(data => {
        data.forEach(post => {
          delete post.auth;
          const params = {
            author: info,
            updated: time.now(true)
          };
          this.update(table, {id: post.id}, params);
        });
      });
    },

    /**
     * Generic update function
     * @param {!string} table - database table
     * @param {!Object} query - object to update
     * @param {!Object} value - new values
     * @return {void}
     */
    update(table, query, value) {
      db.upsertObj(table, query, value);
    }
  });
})();
