const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const log = require('./log');
const fn = require('./functions');
const mongoose = require('mongoose');

/**
 * Local constiables.
 */
const host = `127.0.0.1:27017/${config.col}`;
let url = `mongodb://${host}`;
if (config.col_auth) {
  url = `mongodb://${config.col}:${config.col_auth}@${host}`;
}
if (config.col) {
  mongoose.connect(url);
}


module.exports.mongoose = mongoose;

/**
 * Log data in debug mode
 * @return {void}
 */
module.exports.trace = function() {
  const debugMode = ['debug', 'init', 'dev'].some(
    x => x === process.argv[2]);
  if (debugMode) {
    log.info(arguments);
  }
};


/**
 * Update current database with given JSON data
 * @param {string} name - table to update
 * @param {Object} data - JSON values to insert
 * @return {void}
 */
function writeJson(name, data) {
  if (data) {
    const json = JSON.stringify(data);
    fs.writeFile('db/' + name + '.json', json, () => {
      log.info('The collection', name, 'has been saved');
    });
  }
}


/**
 * Update current database with given JSON data
 * @param {string} col - Name of the collecitont to update.
 * @param {number} index - index for the current table being updated
 * @param {number} size - number of tables to update
 * @return {void}
 */
function getCollectionData(col, index, size) {
  if (col.name.indexOf('.') < 0) {
    findAll(col.name, {}).then(data => {
      writeJson(col.name, data, size);
    });
  }
}


/**
 * Save database data for later restore.
 * @return {void}
 */
module.exports.saveDatabaseData = function() {
  mkdirp(path.dirname('db/info.js'), () => {
    MongoClient.connect(url, (_, db) => {
      const content = 'module.exports = "' + db.databaseName + '";';
      fs.writeFile('db/info.js', content);
      db.listCollections().toArray(function(err, collections){
        collections.forEach(function(col, index){
          getCollectionData (col, index, collections.length);
        });
      });
    });
  });
};


/**
 * Save database data for later restore.
 * @return {void}
 */
module.exports.prepareDatabase = function(){
  drop(config.uploads).then(() => {
    const insert = { files: [], count: 0, key: 'denorm'};
    insertObj(config.uploads, insert).then(() => {
      log.info('uploads collection has been', 'initialized');
    });
  });
};


/**
 * @param {!Mongo.Database} db - current database
 * @param {number=} time - in milliseconds
 * @return {void}
 */
function closeConnection(db, time) {
  time = time || 2;
  setTimeout(() => {
    log.debug('closing connection soon!');
  }, time/2);
  setTimeout(() => {
    db.close();
    log.debug('collection closed');
    process.exit(0);
  }, time);
}


/**
 * @param {string} table - valid table name in the current database.
 * @param {!Object} data - JSON object to insert.
 * @return {void}
 */
function insertFromJson(table, data) {
  MongoClient.connect(url, (err, db) => {
    const collection = db.collection(table);
    if (data instanceof Array){
      log.info('Trying to process array...');
      data.forEach((elem, index) => {
        collection.insert(elem, (err, records) => {
          log.debug('Added', index + 1, 'elements', records.ops[0]._id);
        });
      });
      closeConnection(db, 10000);
    } 
    else {
      collection.insert(data, () => {
        log.debug('collection', table, 'Initialize');
        closeConnection(db, 10);
      });
    }
  });
}

/**
 * Reinitialize a collection
 * @param {string} table - valid table name in the current database.
 * @return {void}
 */
module.exports.resetCollection = function(table){
  MongoClient.connect(url, (err, db) => {
    log.debug('Connected correctly to server');
    const collection = db.collection(table);
    collection.drop(() => {
      log.debug('collection', table, 'Dropped');
      fs.readFile('./json/' + table + '.json', 'utf8', (err, data) => {
        const json = JSON.parse(data);
        insertFromJson(table, json);
      });
    });
  });
};


/**
 * Remove the first elem if found
 * @param {!string} col - a valid database table
 * @param {!Object} query - object to remove
 * @param {Object} mod - additional query selector
 * @return {Promise} - resolved on success otherwise reject
 */
module.exports.remove = function(col, query, mod){
  return new Promise((resolve, reject) => {
  try{
    MongoClient.connect(url, (err, db) => {
      const collection = db.collection(col);
      collection.remove(query, mod, (err, res) => {
        if (err){
          log.error(err);
          reject(err);
        }
        else {
          resolve(res);
        }
        db.close();
      });
    });
  }
  catch (err){
    log.error(err);
    reject(err);
  }
  });
};

/**
 * Remove the specified collection.
 * @param {!string} col - valid database table
 * @return {Promise} - resolved on success otherwise reject
 */
function drop(col){
  return new Promise((resolve, reject) => {
  try{
    MongoClient.connect(url, (_, db) => {
      db.collection(col).drop(data => resolve(data));
    });
  }
  catch (err){
    log.error(err);
    reject(err);
  }
  });
}
module.exports.drop = drop;


/**
 * Return a connect to local mongo database.
 * @return {Promise} - resolved on success otherwise reject
 */
function getDb(){
  return new Promise((resolve, reject) => {
    try{
      MongoClient.connect(url, (err, db) => {
        if (db) {
          db.authenticate(config.col, config.col_auth, error => {
            if (error) {
              reject(error);
            }
            else {
              resolve(db);
            }
          });
        }
        else {
          log.error(err);
          reject(err);
        }
      });
    }
    catch (err){
      log.error(err);
      reject(err);
    }
  });
}
module.exports.getDb = getDb;

/** Find the first element in a specific collection.
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} query - Select object to update.
 * @param {Object} finder - query selector
 * @return {Promise} - resolved on success otherwise reject
 */
module.exports.findOne = function(col, query, finder){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        const collection = db.collection(col);
        collection.find(query, finder).toArray((err, docs) => {
          if (err || !docs){
            log.error(err);
            reject(err);
          }
          else
            resolve(docs[0]);
          db.close();
        });
      }
    });
  });
};

/** Find all the elements in a specific collection.
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} query - Select object to update.
 * @param {Object} finder - query selector
 * @return {Promise} - resolved on success otherwise reject
 */
function findAll(col, query, finder){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        const collection = db.collection(col);
        collection.find(query, finder).toArray((err, docs) => {
          if (err || !docs){
            log.error(err);
            reject(err);
          }
          else{
            resolve(docs);
          }
          db.close();
        });
      }
    });
  });
}
module.exports.findAll = findAll;

/**
 * Get Contacts.
 * @return {Promise} - resolved on success otherwise reject
 */
module.exports.getContacts = function(){
  return new Promise((resolve, reject) => {
  MongoClient.connect('mongodb://localhost:27017/wspecs', (err, db) => {
    const collection = db.collection('contacts');
    collection.find({}, { _id: 0}).toArray((err, docs) => {
      if (err || !docs){
        log.error(err);
        reject(err);
      }
      else{
        resolve(docs);
      }
      db.close();
    });
  });
  });
};

/**
 * Update or Insert item (if it does not exists) in a specific collection
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} query - Select object to update.
 * @param {Object} update - new values
 * @return {Promise} - resolved on success otherwise reject
 */
function upsertObj(col, query, update){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        db.collection(col).update(query,
          {$set: update},
          { upsert: true },
          (err, res) => {
            if (err) {
              fn.reject(err, reject);
            }
            else {
              resolve(res);
            }
            db.close();
          }
        );
      }
    });
  });
}
module.exports.upsertObj = upsertObj;

/**
 * Insert an object in a specified collection
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} ins - Object to insert in collection.
 * @return {Promise} - resolved on success otherwise reject
 */
function insertObj(col, ins){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        db.collection(col).insert(ins, (err, res) => {
          if (err) {
            log.error(err);
            reject(err);
          }
          else {
            resolve(res);
          }
          db.close();
        });
      }
    });
  });
}
module.exports.insertObj = insertObj;

/**
 * Insert multiple objects in a specified collection
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} ins - Object to insert in collection.
 * @return {Promise} - resolved on success otherwise reject
 */
module.exports.insertMany = function(col, ins){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        db.collection(col).insertMany(ins, (err, res) => {
          if (err) {
            log.error(err);
            reject(err);
          }
          else {
            resolve(res);
          }
          db.close();
        });
      }
    });
  });
};

/**
 * Insert an object in a specified collection
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} query - Select object to update.
 * @param {Object} update - new values
 * @return {Promise} - resolved on success otherwise reject
 */
module.exports.updateInfo = function(col, query, update){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        db.collection(col).updateMany(query, update, {multi: true}, (err, data) => {
          if (err) {
            log.error(err);
            reject(err);
          }
          else {
            resolve(data);
          }
          db.close();
        });
      }
    });
  });
};

/**
 * Insert an object in a specified collection
 * @param {string} col - Name of the collecitont to update.
 * @param {Object} projection - projection info
 * @param {string} updateKey - attribute to update
 * @param {Object} selector - query selector
 * @return {void}
 */
module.exports.aggregate = function(col, projection, updateKey, selector){
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      if (db) {
        const query = [{$project: projection}];
        db.collection(col).aggregate(query, (err, data) => {
           if (updateKey && data && data[0] && data[0][updateKey]) {
             const update = {};
             update[updateKey] = data[0][updateKey];
             selector = selector || {};
             upsertObj(col, selector, update, () => resolve());
           } 
           else if (data) {
             resolve(data);
           }
           else {
             reject();
           }
        });
      }
    });
  });
};

/**
 * Send data back to the requester.
 * @param {!{send: !Function}} res - HTTP Response
 * @return {void}
 */
module.exports.authError = function(res) {
  respond(res, false, 'Authentication Error: Relogin');
};

/**
 * Send data back to the requester.
 * @param {!{send: !function}} res - HTTP Response
 * @param {boolean} status - true for successful response
 * @param {string} msg - response message
 * @param {boolean} print - debug call
 * @return {void}
 */
function respond(res, status, msg, print){
  if (res.headersSent) {
    return;
  }
  let response = {};
  if (msg || status === true || status === false) {
    response = {
      success: status,
      msg: msg
    };
    if (!msg)
      delete response.msg;
  } 
  else
    response = status;

  if (print === undefined || print === true)
    log.debug(response);
  res.send(response);
}
module.exports.repond = respond
