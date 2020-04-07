const mongoose = require('mongoose');
const StatusSchema = require('./schemas/status');
const { logDatabase } = require('../utils/logger');

const Status = mongoose.model('Status', StatusSchema);

Status.findByTag = (tag, callback) => {
  logDatabase('QUERY: Executing findOneByTag - By Email');
  Status.findOne({ tag }).exec(callback);
};

const statusTags = {
  EmValidacao: 'EV',
  Reprovado: 'RE',
  Aprovado: 'AP',
};

module.exports = {
  Status,
  statusTags,
};
