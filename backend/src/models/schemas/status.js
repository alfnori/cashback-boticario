const mongoose = require('mongoose');

const { Schema } = mongoose;

const statusTags = {
  EmValidacao: 'EV',
  Reprovado: 'RE',
  Aprovado: 'AP',
};

/**
 * Mongo collection Status
 * @constructor StatusSchema
 */
const StatusSchema = new Schema({
  name: String,
  order: Number,
  tag: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

StatusSchema.set('toJSON', { getters: true, virtuals: false });
StatusSchema.index({ tag: 1 }, { unique: true });

module.exports = {
  StatusSchema,
  statusTags,
};
