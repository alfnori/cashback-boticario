const mongoose = require('mongoose');
const UsersSchema = require('./complexSchemas/user');
const { logDatabase } = require('../utils/logger');
const helpers = require('../helpers/models/user');

const Users = mongoose.model('Users', UsersSchema);

// Methods
Users.generateSecrets = (password, callback) => helpers.generateSecrets(password, callback);
Users.compareSecrets = (pass, enc, callback) => helpers.compareSecrets(pass, enc, callback);
Users.generateJWT = (user) => helpers.generateJWT(user);

Users.getUserByEmail = (email, callback) => {
  logDatabase('QUERY: Executing findOne - By Email');
  Users.findOne({ email }, ['_id', 'name', 'cpf', 'email', 'role', 'password']).exec(callback);
};

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
