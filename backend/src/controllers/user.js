const controller = {};

const { assembleError, jsonResponse } = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');

const UserModel = require('../models/user');

const assembleUser = (data) => ({
  user: {
    name: data.name,
    email: data.email,
    cpf: data.cpf,
    role: data.role,
  },
});

const tokenResponse = (user, res) => {
  const jwtToken = UserModel.generateJWT(user);
  jsonResponse(null, { token: jwtToken, ...assembleUser(user) }, res);
};

controller.authenticate = (req, res) => {
  try {
    UserModel.getUserByEmail(req.body.email, (error, user) => {
      if (error) jsonResponse(error, null, res);
      else if (!user || !user.password) {
        const customError = assembleError({
          message: 'User Not Found!',
          param: 'email',
        });
        jsonResponse(customError, null, res);
      } else {
        try {
          UserModel.compareSecrets(req.body.password, user.password, (err, matched) => {
            if (err || !matched) {
              const customError = assembleError({
                message: "Password Doesn't Match!",
                param: 'password',
              });
              jsonResponse(customError, null, res);
            } else {
              tokenResponse(user, res);
            }
          });
        } catch (err) {
          jsonResponse(err, null, res);
        }
      }
    });
  } catch (error) {
    jsonResponse(error, null, res);
  }
};

controller.register = (req, res) => {
  try {
    UserModel.createUser(req.body, (error, user) => {
      if (error) jsonResponse(error, null, res);
      else tokenResponse(user, res);
    });
  } catch (error) {
    jsonResponse(error, null, res);
  }
};

controller.currentUser = (req, res) => {
  if (!isEmptyObject(req.user)) {
    jsonResponse(null, assembleUser(req.user), res);
  } else {
    const customError = assembleError({
      message: 'Invalid User from token!',
      param: 'token',
    });
    jsonResponse(customError, null, res);
  }
};

module.exports = controller;
