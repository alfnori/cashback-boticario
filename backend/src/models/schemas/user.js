const mongoose = require('mongoose');
const typeEmail = require('mongoose-type-email');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const timestamps = require('mongoose-timestamp');
const validatorCPF = require('cpf-cnpj-validator').cpf;

const { Schema } = mongoose;
const { validateCPF, messages } = require('../../utils/validators');

const userRoles = {
  ADMIN: 'admin',
  USER: 'user',
};

const UsersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: typeEmail,
    lowercase: true,
    required: true,
    unique: true,
    index: true,
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
  role: { type: String, default: userRoles.USER },
});

// CPF Getters & Setters
UsersSchema.path('cpf').get((cpf) => validatorCPF.format(cpf));
UsersSchema.path('cpf').set((cpf) => validatorCPF.strip(cpf));
UsersSchema.set('toJSON', { getters: true, virtuals: false });

// Indexes
UsersSchema.index({ name: 1, email: 1, cpf: 1 });
UsersSchema.index({ email: 1 }, { unique: true });
UsersSchema.index({ cpf: 1 }, { unique: true });

// Plugins
UsersSchema.plugin(timestamps);
UsersSchema.plugin(beautifyUnique, {
  defaultMessage: messages.schemas.unique,
});

module.exports = {
  UsersSchema,
  userRoles,
};
