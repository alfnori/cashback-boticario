const mongoose = require('mongoose');
const { StatusSchema } = require('./schemas/status');
const { logDatabase } = require('../utils/logger');

const Status = mongoose.model('Status', StatusSchema);

Status.findByTag = (tag, callback) => {
  logDatabase(`QUERY: Executing findOneByTag: ${tag}`);
  Status.findOne({ tag }).exec(callback);
};

Status.findByTagAsync = (tag) => new Promise((resolve, reject) => {
  const callback = (error, status) => {
    if (error) reject(error);
    else resolve(status);
  };
  Status.findByTag(tag, callback);
});

module.exports = Status;
