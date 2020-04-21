const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const {
  validatorCPF, validateCPF, validateCode, messages,
} = require('../../utils/validators');

const PurchasesSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: validateCode,
      message: messages.code.default,
    },
  },
  cpf: {
    type: String,
    required: true,
    validate: {
      validator: validateCPF,
      message: messages.cpf.default,
    },
  },
  value: {
    type: Number,
    required: true,
    min: 0.01,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    required: true,
    type: ObjectId,
    ref: 'Status',
  },
  cashback: {
    required: false,
    type: {
      value: {
        required: true,
        type: Number,
        min: 0,
      },
      bonus: {
        required: true,
        type: Number,
        min: 0,
      },
      bonusType: {
        required: true,
        type: String,
      },
    },
  },
});

// CPF Getters & Setters
PurchasesSchema.path('cpf').get((cpf) => validatorCPF.format(cpf));
PurchasesSchema.path('cpf').set((cpf) => validatorCPF.strip(cpf));
PurchasesSchema.set('toJSON', { getters: true, virtuals: false });

PurchasesSchema.index({ cpf: 1, date: 1, status: 1 });
PurchasesSchema.index({ code: 1 }, { unique: true });
PurchasesSchema.plugin(timestamps);
PurchasesSchema.plugin(beautifyUnique, {
  defaultMessage: messages.schemas.unique,
});

module.exports = PurchasesSchema;
