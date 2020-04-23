const express = require('express');

/**
 * @classdesc Authentication Router
 * @name RouterAuthentication
 * @class
 */
const authRouter = express.Router();

const middleware = require('../middlewares/user');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/user');

/**
 * @name signIN Signs in an user
*/
authRouter.post('/sign/in',
  middleware.signIN(),
  middleware.signInIsValid,
  handleError(async (req, res, next) => {
    logRequest('AUTHENTICATE USER');
    controller.authenticate(req, res, next);
  }));


/**
 * @name signUP Signs up an user
*/
authRouter.post('/sign/up',
  middleware.signUP(),
  middleware.signUpIsValid,
  handleError(async (req, res, next) => {
    logRequest('REGISTER USER');
    controller.register(req, res, next);
  }));

module.exports = authRouter;
