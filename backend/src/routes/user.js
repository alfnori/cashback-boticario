const express = require('express');

const userRouter = express.Router();

const middleware = require('../middlewares/user');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/user');

userRouter.post('/sign/in',
  middleware.signIN(),
  middleware.signInIsValid,
  handleError(async (req, res, next) => {
    logRequest('AUTHENTICATE USER');
    controller.authenticate(req, res, next);
  }));

userRouter.post('/sign/up',
  middleware.signUP(),
  middleware.signUpIsValid,
  handleError(async (req, res, next) => {
    logRequest('REGISTER USER');
    controller.register(req, res, next);
  }));

module.exports = userRouter;
