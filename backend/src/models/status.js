const mongoose = require('mongoose');
const { StatusSchema } = require('./schemas/status');
const { logDatabase } = require('../utils/logger');

const Status = mongoose.model('Status', StatusSchema);

Status.findByTag = (tag, callback) => {
  logDatabase(`QUERY: Executing findOneByTag: ${tag}`);
  Status.findOne({ tag }).exec(callback);
};

module.exports = Status;
