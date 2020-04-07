const mongoose = require('mongoose');

const { Schema } = mongoose;

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

StatusSchema.index({ tag: 1 }, { unique: true });

module.exports = StatusSchema;
