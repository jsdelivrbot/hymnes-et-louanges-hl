/*
 * File to interact with database.
 */
const api = require('./../main');
const db = api.lib.database;

const SONG_SIZE = 50;  // Number of songs in numeric indexer.
let AZ_KEYS = [];
let NUMBER_KEYS = [];


/**
 * Initialize Hymns Alpha and Numeric Indexers for faster performance.
 * @return {void}
 */
module.exports.initialize = function() {
  db.findAll('az', {}).then(function(data) {
    data.forEach(function(list) {
      AZ_KEYS.push(list.key);
    });
    AZ_KEYS = AZ_KEYS.sort(function(a, b) {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  });
  db.findAll('number', {}).then(function(data) {
    data.forEach(function(list) {
      NUMBER_KEYS.push(list.key);
    });
    NUMBER_KEYS = NUMBER_KEYS.sort(function(a, b) {return a - b;});
  });
}

/**
 * @param {!{
 *  params: {number: string}
 * }} req - HTTP Request
 * @param {!{
 *  send: function
 * }} res - HTTP Response
 * @return {void}
 */
function chant(req, res) {
  const number = parseInt(req.params.number || 1, 10);
  if (isNaN(number)) {
    res.send({});
  }
  db.findOne('hymns', {number}, {_id: 0})
    .then(data => res.send(data))
    .catch(() => res.send({}));
}

/**
 * @param {!{
 *  params: {number: string}
 * }} req - HTTP Request
 * @param {!{
 *  send: function
 * }} res - HTTP Response
 * @return {void}
 */
function number(req, res) {
  let key = parseInt(req.params.number || 1, 10);
  if (isNaN(key)) key = 1;
  key = (parseInt((key-1) / SONG_SIZE) * SONG_SIZE) + 1;
  db.findOne('number', {key: key}, {_id: 0})
    .then(list => res.send({key: NUMBER_KEYS, list}))
    .catch(() => res.send({}));
}

/**
 * @param {!{
 *  params: {key: string}
 * }} req - HTTP Request
 * @param {!{
 *  send: function
 * }} res - HTTP Response
 * @return {void}
 */
function az(req, res) {
  const key = (req.params.key || 'A').toUpperCase();
  db.findOne('az', {key: key}, {_id: 0})
    .then(list => res.send({key: AZ_KEYS, list}))
    .catch(() => res.send({}));
}


/**
 * Modules endpoints
 * @return {void}
 */
module.exports.getEndPoints = function() {
  return {
    get: [
      {
        path: '/chant/:number',
        sample: '/chant/1',
        handler: chant,
        title: 'Get Song',
        responsePath: './docs/chant-response.json'
      },
      {
        path: '/number/:number',
        sample: '/number/365',
        handler: number,
        title: 'List Numeric Index',
        responsePath: './docs/number-response.json'
      },
      {
        path: '/az/:key',
        sample: '/az/u',
        handler: az,
        title: 'List Alphabetize Index',
        responsePath: './docs/az-response.json'
      },
    ],
  };
}
