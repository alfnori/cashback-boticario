const express = require('express');

/**
 * @classdesc Users Router
 * @name RouterUsers
 * @class
 */
const userRouter = express.Router();

const middleware = require('../middlewares/user');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/user');

/**
 * @name current Get current user
 */
userRouter.get('/current',
  handleError(async (req, res, next) => {
    logRequest('CURRENT USER');
    controller.currentUser(req, res, next);
  }));

/**
 * @name cashback Get current user total cashback
 */
userRouter.get('/cashback',
  middleware.cashback(),
  middleware.cashbackIsValid,
  handleError(async (req, res, next) => {
    logRequest('CASHBACK');
    controller.totalCashback(req, res, next);
  }));

module.exports = userRouter;
