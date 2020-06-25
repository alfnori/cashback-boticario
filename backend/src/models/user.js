const mongoose = require('mongoose');
const { UsersSchema } = require('./schemas/user');
const { logDatabase } = require('../utils/logger');
const helpers = require('../helpers/models/user');

/**
 * Mongoose Model Users
 * @constructs UsersModel
 */
const Users = mongoose.model('Users', UsersSchema);

// Methods

/**
 * Generates user secrets with bcrypt
 *
 * @function generateSecrets
 * @param {String} password User plain password
 * @param {CallableFunction} callback Callback function for result
 * @memberof UsersModel
 */
Users.generateSecrets = (password, callback) => {
  try {
    helpers.generateSecrets(password, callback);
  } catch (error) {
    callback(error);
  }
};

/**
 * Compare user secrets with plain password
 *
 * @function compareSecrets
 * @param {String} password User plain password
 * @param {String} encrypted User secret password
 * @param {CallableFunction} callback Callback function for result
 * @memberof UsersModel
 */
Users.compareSecrets = (password, encrypted, callback) => {
  try {
    helpers.compareSecrets(password, encrypted, callback);
  } catch (error) {
    callback(error);
  }
};

/**
 * Generate JWT Token with user info
 *
 * @function generateJWT
 * @param {*} user User data
 * @param {CallableFunction} callback Callback function for result
 * @memberof UsersModel
 */
Users.generateJWT = (user) => helpers.generateJWT(user);

/**
 * Get an user by email
 *
 * @function getUserByEmail
 * @param {String} email User email
 * @param {CallableFunction} callback Callback function for result
 * @memberof UsersModel
 */
Users.getUserByEmail = (email, callback) => {
  logDatabase(`QUERY: Executing findOneByEmail: ${email}`);
  Users.findOne({ email }, ['_id', 'name', 'cpf', 'email', 'role', 'password']).exec(callback);
};

/**
 * Create an user
 *
 * @function getUserByEmail
 * @param {*} data User data
 * @param {CallableFunction} callback Callback function for result
 * @memberof UsersModel
 */
Users.createUser = (data, callback) => {
  logDatabase('MODEL: Executing create');
  Users.generateSecrets(data.password, (error, secrets) => {
    if (error) {
      callback(error);
    } else {
      const create = { ...data, ...secrets };
      Users.create(create, callback);
    }
  });
};

module.exports = Users;
