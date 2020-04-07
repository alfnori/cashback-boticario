const express = require('express');

const statusRouter = express.Router();

const { logDatabase } = require('../utils/logger');
const { jsonResponse } = require('../helpers/request/index');
const { tagValidator, tagIsValid } = require('../middlewares/purchases');

const StatusDB = require('../models/status').Status;

statusRouter.get('/', (req, res) => {
  logDatabase('STATUS: Executing findAll');
  StatusDB.find({}, 'name tag order',
    (error, status) => jsonResponse(error, { status }, res))
    .sort({ order: 'asc' });
});

statusRouter.get('/tag/:tag',
  tagValidator(),
  tagIsValid,
  (req, res) => {
    logDatabase('STATUS: Executing findByTag');
    StatusDB.findByTag(req.params.tag,
      (error, status) => jsonResponse(error, { status }, res));
  });

module.exports = statusRouter;
