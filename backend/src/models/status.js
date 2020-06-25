const mongoose = require('mongoose');
const { StatusSchema } = require('./schemas/status');
const { logDatabase } = require('../utils/logger');
const StatusCache = require('../helpers/models/status');

/**
 * Mongoose Model Status
 * @constructs StatusModel
 */
const Status = mongoose.model('Status', StatusSchema);
const cache = new StatusCache(Status);

/**
 * Initialize 'cache' status
 *
 * @function initCache
 * @memberof StatusModel
 */
Status.initCache = async () => {
  await cache.init();
};

/**
 * Return all status
 *
 * @function findAll
 * @memberof StatusModel
 */
Status.findAll = () => {
  logDatabase('Executing findAll');
  return cache.get();
};

/**
 * Return status by tag
 *
 * @function findByTag
 * @param {String} tag
 * @memberof StatusModel
 */
Status.findByTag = (tag) => {
  logDatabase(`Executing findByTag: ${tag}`);
  return cache.tag(tag);
};

module.exports = Status;
