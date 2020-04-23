const validatorCPF = require('cpf-cnpj-validator').cpf;
const { envs, get } = require('./env');

/**
 * Validates a given string as a valid CPF
 *
 * @param {String} cpf A string that represent a CPF
 * @returns {Boolean} True if is a valid CPF
 */
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
/**
 * Validates a given string to be as a CODE
 *
 * @param {String} code A string that represent a purchases code
 * @returns {Boolean} True if is a valid CODE
 */
const validateCode = (code) => code && code.length === 10;

/**
 * Validation messages
 *
 * @readonly
 * @enum {*}
 */
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
