(function() {
  /**
   * @module
   * @desc Helper class to create object.
   */

  const randomstring = require('randomstring');
  const time = require('./time');
  const fn = require('./functions');


  /**
   * Creates new cardInfo object for admin dashboard.
   * @param {string} title - title for the card
   * @param {string} info - short description
   * @param {Array<Array<string>>} actions - available actions
   * @param {string} type - category for the card
   * @param {Object} result - prefilled card info object
   * @return {{
   *  title: string,
   *  type: string,
   *  info: string,
   *  actions: Array<{icon: string, action: string}>
   * }} - a card object
   */
  function toCardInfo(title, info, actions, type, result) {
    result = result || {};
    if (!result.type)
      result.type = type || result.severity || 'default';
    if (!result.title)
      result.title = title;
    if (!result.info)
      result.info = info;
    if (!result.actions) {
      result.actions = [];
      actions = actions || result.actionlist;
      actions.forEach(function(action) {
        if (action.length === 2) {
          result.actions.push({
            icon: action[0],
            action: action[1]
          });
        }
      });
    }
    delete result.severity;
    delete result.actionlist;
    return result;
  }


  /**
   * Convert args to a user object.
   * @param {!Object} args - request payload
   * @param {!string} key - unique identifier
   * @return {Object} - a user's info
   */
  function toUser(args, key) {
    return {
        first: args.first.capFirst(), 
        last: args.last.capFirst(),
        email: args.email.toLowerCase(),
        pass: args.pass,
        user: args.user.toLowerCase(),
        type: 'user',
        question: args.question.capFirst(),
        answer: args.answer.toLowerCase(),
        verify: false,
        key: key,
        userId: randomstring.generate(8)
      };
  }


  /**
   * Transform author social media's info to an object.
   * @param {!Object} data - request payload
   * @return {Object} - author info
   */
  function toAuthorInfo(data) {
    data.email = data.links[0].link;
    data.sm = {};
    for (let i = 1; i < data.links.length; i++) {
      data.sm[data.links[i].sm] = data.links[i].link;
    }
    delete data.links;  
    return {
      success: true,
      data: data
    };
  }


  /**
   * Convert args to a mongo query object
   * @param {!Object} args - request payload
   * @return {Object} - user info first step in password recovery
   */
  function queryForgotStepOne(args) {
    return {
      last: args.last.capFirst(),
      email: args.email.toLowerCase(),
      verify: true
    };
  }

  /**
   * Convert args to a mongo query object
   * @param {!Object} args - request payload
   * @return {Object} - user info second step in password recovery
   */
  function queryForgotStepTwo(args) {
    return {
      answer: args.answer.toLowerCase(),
      key: args.key,
      'restore.step': 2
    };
  }

  /**
   * Convert args to a mongo query object
   * @param {!Object} args - request payload
   * @return {Object} - user login info
   */
  function queryLogin(args) {
    const query = {
      user: args.user,
      password: args.pass,
      verify: true
    };
    if (fn.IsEmail(args.user)) {
      delete query.user;
      query.email = args.user || args.email;
    }
    return query;
  }


  /**
   * Provide info to udate database before passing on to step three of restore.
   * @return {Object} - backend info in first step for password recovery
   */
  function updateForgotStepOne() {
    return {
      key: randomstring.generate(16),
      restore: {
        step: 2,
        time: time.now()
      }
    };
  }


  /**
   * Update database to keep track of number of sessions running.
   * @param {!Object} data - request payload
   * @return {Object} - current session info
   */
  function updateLogin(data) {
    let session = randomstring.generate(16);
    let numberOfConnection = 1;
    if (data.session && data.session.size && data.session.key) {
      session = data.session.key;
      numberOfConnection = data.session.size + 1;
      if (!fn.IsValidSession(data.session.time))
        numberOfConnection = 1;
    }
    const update = {
      session:{
        key: session,
        time: time.now(),
        size: numberOfConnection
      }
    };
    return update;
  }


  /**
   * Info to keep track of number of sessions running.
   * @param {!Object} data - request payload
   * @param {string} key - unique identifier
   * @return {Object} - current session info
   */
  function updateSession(data, key) {
    return {
      session:{
        key,
        time: time.now(),
        size: data.session.size
      }
    };
  }


  /**
   * Clean author object beore presention sending info to frontend
   * @param {!Object} author - general info about an author.
   * @return {Object} - modified author info
   */ 
  function cleanAuthor(author) {
    delete author.auth;
    delete author.email;
    delete author.sm;
    return author;
  }


  /**
   * Clean list of authors for presentation mode.
   * @param {!Object} response - request payload
   * @return {Object} - info to template rendering
   */
  function cleanAuthorsList(response) {
    for (let i = 0; i < response.data.length; i++) {
      response.data[i].name = response.data[i].first;
      response.data[i].name += ' ' + response.data[i].last;
      response.data[i].email = response.data[i].links[0].link;
      delete response.data[i].middle;
      delete response.data[i].about;
      delete response.data[i].last;
      delete response.data[i].first;
      delete response.data[i].links;
    }
    response.success = true;
    return response;
  }


  /**
   * Public export for this module
   */
  module.exports = {
    to: {
      user: toUser,
      authorInfo: toAuthorInfo,
      cardInfo: toCardInfo,
    },
    query: {
      forgotStepOne: queryForgotStepOne,
      forgotStepTwo: queryForgotStepTwo,
      login: queryLogin,
    },
    update: {
      forgotStepOne: updateForgotStepOne,
      login: updateLogin,
      session: updateSession,
    },
    clean: {
      author: cleanAuthor,
      authorsList: cleanAuthorsList,
    },
  };
})();
