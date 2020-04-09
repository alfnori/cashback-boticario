const express = require('express');

const statusRouter = express.Router();

const { logDatabase } = require('../utils/logger');
const { jsonResponse, handleError } = require('../helpers/request');
const { tagValidator, tagIsValid } = require('../middlewares/purchases');

const StatusDB = require('../models/status');

statusRouter.get('/', handleError(async (req, res) => {
  logDatabase('STATUS: Executing findAll');
  StatusDB.find({}, 'name tag order',
    (error, status) => jsonResponse(error, { status }, res))
    .sort({ order: 'asc' });
}));

statusRouter.get('/tag/:tag',
  tagValidator(),
  tagIsValid,
  handleError(async (req, res) => {
    logDatabase('STATUS: Executing findByTag');
    StatusDB.findByTag(req.params.tag,
      (error, status) => jsonResponse(error, { status }, res));
  }));

module.exports = statusRouter;
