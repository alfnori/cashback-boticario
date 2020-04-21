const mongoose = require('mongoose');
const { StatusSchema } = require('./schemas/status');
const { logDatabase } = require('../utils/logger');
const StatusCache = require('../helpers/models/status');

const Status = mongoose.model('Status', StatusSchema);
const cache = new StatusCache(Status);

Status.initCache = async () => {
  await cache.init();
};

Status.findAll = () => {
  logDatabase('Executing findAll');
  return cache.get();
};

Status.findByTag = (tag) => {
  logDatabase(`Executing findByTag: ${tag}`);
  return cache.tag(tag);
};

module.exports = Status;
