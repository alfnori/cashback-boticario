/**
 * @classdesc Users controller
 * @name ControllerUsers
 * @class
 */
const controller = {};

const { errorResponse, jsonResponse } = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');
const {
  userTokenResponse, userErrorResponse, UserErrors,
} = require('../helpers/request/user');
const UserModel = require('../models/user');
const { retriveCashbackByCPF } = require('../services/cashback');

/**
 * Authenticate method - Authenticates an user to receive new token
 * @method
 * @name authenticate
 * @param {Request} req Router Request
 * @param {Response} res Router Response
*/
controller.authenticate = (req, res) => {
  UserModel.getUserByEmail(req.body.email, (error, user) => {
    if (error || !user || !user.password) {
      userErrorResponse(UserErrors.UserNotFound, res, req.body.email);
    } else {
      UserModel.compareSecrets(req.body.password, user.password, (err, matched) => {
        if (err || !matched) {
          userErrorResponse(UserErrors.PasswordDoesntMatch, res, req.body.password);
        } else {
          userTokenResponse(user, res);
        }
      });
    }
  });
};

/**
 * Register method - Creates a new user
 * @method
 * @name register
 * @param {Request} req Router Request
 * @param {Response} res Router Response
*/
controller.register = (req, res) => {
  try {
    UserModel.createUser(req.body, (error, user) => {
      if (error) errorResponse(error, res);
      else userTokenResponse(user, res);
    });
  } catch (error) {
    errorResponse(error, res);
  }
};

/**
 * CurrentUser method - Returns current user from token
 * @method
 * @name currentUser
 * @param {Request} req Router Request
 * @param {Response} res Router Response
*/
controller.currentUser = (req, res) => {
  if (!isEmptyObject(req.user)) {
    userTokenResponse(req.user, res);
  } else {
    userErrorResponse(UserErrors.InvalidUserToken, res);
  }
};

/**
 * TotalCashback method - Retrives accumulated Cashback by CPF
 * @method
 * @name totalCashback
 * @param {Request} req Router Request
 * @param {Response} res Router Response
*/
controller.totalCashback = (req, res) => {
  retriveCashbackByCPF(req.query.cpf, (error, data) => {
    jsonResponse(error, { cashback: data }, res);
  });
};

module.exports = controller;
