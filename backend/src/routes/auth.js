const express = require('express');

const authRouter = express.Router();

const middleware = require('../middlewares/user');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/user');

authRouter.post('/sign/in',
  middleware.signIN(),
  middleware.signInIsValid,
  handleError(async (req, res, next) => {
    logRequest('AUTHENTICATE USER');
    controller.authenticate(req, res, next);
  }));

authRouter.post('/sign/up',
  middleware.signUP(),
  middleware.signUpIsValid,
  handleError(async (req, res, next) => {
    logRequest('REGISTER USER');
    controller.register(req, res, next);
  }));

module.exports = authRouter;
