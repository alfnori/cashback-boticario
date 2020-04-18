const express = require('express');

const statusRouter = express.Router();

const { logDatabase } = require('../utils/logger');
const { jsonResponse, handleError } = require('../helpers/request');
const { tagValidator, tagIsValid } = require('../middlewares/purchases');

const Status = require('../models/status');

statusRouter.get('/', handleError(async (req, res) => {
  logDatabase('STATUS: Executing findAll');
  jsonResponse(null, { status: Status.findAll() }, res);
}));

statusRouter.get('/tag/:tag',
  tagValidator(),
  tagIsValid,
  handleError(async (req, res) => {
    const { tag } = req.params;
    logDatabase(`STATUS: Executing findByTag ${tag}`);
    jsonResponse(null, { status: Status.findByTag(tag) }, res);
  }));

module.exports = statusRouter;
