const validatorCPF = require('cpf-cnpj-validator').cpf;
const { envs, get } = require('./env');

const validateCPF = (cpf) => {
  if (cpf && cpf.length >= 11) {
    const willValidateCPF = get(envs.VALIDATE_CPF, true);
    if (willValidateCPF) {
      return validatorCPF.isValid(cpf);
    }
    return cpf.length === 11;
  }
  return false;
};

// TODO Validate code rule with PO
const validateCode = (code) => code && code.length === 10;

const messages = {
  schemas: {
    unique: '{VALUE} already exists.',
  },
  cpf: {
    default: 'You must provide a valid CPF.',
  },
  code: {
    default: 'You must provide a 10 length code.',
  },
};

module.exports = {
  validatorCPF,
  validateCPF,
  validateCode,
  messages,
};
