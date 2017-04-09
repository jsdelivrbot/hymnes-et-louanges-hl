/*
* File to interact with database.
*/
const api = require('./../main');
const db = api.lib.database;


/**
 * @param {!{
 *  params: {number: string}
 * }} req - HTTP Request
 * @param {!{
 *  send: function
 * }} res - HTTP Response
 * @return {void}
 */
function presentation(req, res) {
  if (!req.params.numbers) {
    res.send([]);
    return;
  }

  let numbers = (req.params.numbers || '').split(',');
  numbers = numbers.reduce(function(res, number) {
    number = parseInt(number, 10);
    if (!isNaN(number) && number >= 1 && number <= 654) res.push(number);
    return res;
  }, []);

  const query = api.lib.functions.mongoOrArray('number', numbers);
  db.findAll('hymns', query, {_id: 0, parts: 0}).then(data => {
    const output = [];
    // Output slides in the order requested.
    numbers.forEach(function(number) {
      const val = (data || []).filter(function(x) {
        return x.number === number;
      })[0];
      if (val) output.push(val);
    });
    res.send(output);
  });
}

/**
 * Modules endpoints
 */
module.exports.getEndPoints = function() {
  return {
    get: [
      {
        path: '/presentation/:numbers',
        sample: '/presentation/217',
        title: 'Get Slideshow Info',
        handler: presentation,
        responsePath: './docs/presentation-response.json',
      },
    ],
  };
}
