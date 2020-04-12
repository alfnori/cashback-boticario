const express = require('express');

const userRouter = express.Router();

const middleware = require('../middlewares/user');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/user');

userRouter.get('/current',
  handleError(async (req, res, next) => {
    logRequest('CURRENT USER');
    controller.currentUser(req, res, next);
  }));

userRouter.get('/cashback',
  middleware.cashback(),
  middleware.cashbackIsValid,
  handleError(async (req, res, next) => {
    logRequest('CASHBACK');
    controller.totalCashback(req, res, next);
  }));

module.exports = userRouter;
