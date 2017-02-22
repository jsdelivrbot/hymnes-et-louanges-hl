(function() {
  let fs = require('fs');
  let json = JSON.parse(fs.readFileSync('data/json/hymns.json'));
  const api = require('./../main'),
    args = api.lib.args,
    db = api.lib.database,
    log = api.lib.log,
    search = api.lib.search,
    simpleText = api.lib.simpleText;


  let SONG_SIZE = 50;
  let az = {};
  let number = {};
  let searches = [];

  function add(set, key, value) {
    if (!set[key]) {
      set[key] = {songs: []};
    }
    set[key].songs.push(value);
    set[key].key = key;
  }

  json.forEach(function(song) {
    let number_key = (parseInt((song.number - 1) / SONG_SIZE) * SONG_SIZE) + 1;
    let peak = song['1'].slice(0, 3).join(' ');
    let value = {
      number: song.number,
      title: song.title,
      peak: song['1'][0] + ' ' + song['1'][1] + ' ' + song['1'][2]
    };
    add(number, number_key, value);

    let az_key = simpleText.getIndexer(song['1'][0]);
    add(az, az_key, value);

    let lyrics = song.parts.reduce(function(text, part) {
      text += song[part].join(' ');
      return text;
    }, '');

    searches.push({
      title: song.title,
      paragraph: lyrics,
      ref: String(song.number),
      result: {
        number: song.number,
        title: song.title,
        peak: peak,
      }
    });
  });


  let index_number = [];
  Object.keys(number).forEach(function(key) {
    index_number.push(number[key]);
  });

  let index_az = [];
  Object.keys(az).forEach(function(key) {
    az[key].songs = az[key].songs.sort(function(a, b) {
      a = simpleText.getKey(a.title);
      b = simpleText.getKey(b.title);
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    index_az.push(az[key]);
  });


  function addData(colName, json) {
    db.drop(colName).then(() => {
      db.insertFromJson(colName, json);
    });
  }


  if (args.options.add) {
    log.info('Adding HL data');
    addData('number', index_number);
    addData('az', index_az);
    addData('hymns', json);
  }
  if (args.options.map) {
    log.info('Updating search map');
    search.mapAll(searches, true);
  }
})();
