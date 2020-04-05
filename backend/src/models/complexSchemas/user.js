const mongoose = require('mongoose');
const typeEmail = require('mongoose-type-email');

const { Schema } = mongoose;

const beautifyUnique = require('mongoose-beautiful-unique-validation');
const timestamps = require('mongoose-timestamp');

const nonUniqueMessage = '{VALUE} already exists.';
const { validateCPF, messages } = require('../../utils/validators');

const UsersSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: typeEmail,
    lowercase: true,
    required: true,
    unique: true,
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validateCPF,
      message: messages.cpf.default,
    },
  },
  password: { type: String, required: true },
  salt: {
    type: String,
    required() {
      return this.password != null;
    },
  },
  role: { type: String, default: 'user' },
});

UsersSchema.index({ name: 1, email: 1, cpf: 1 });
UsersSchema.index({ email: 1 }, { unique: true });
UsersSchema.index({ cpf: 1 }, { unique: true });

UsersSchema.plugin(timestamps);
UsersSchema.plugin(beautifyUnique, {
  defaultMessage: nonUniqueMessage,
});

module.exports = UsersSchema;
