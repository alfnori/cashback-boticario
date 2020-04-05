const cpfValidator = require('cpf-cnpj-validator').cpf;
const { envs, get } = require('./env');

const validateCPF = (cpf) => {
  if (cpf && cpf.length >= 11) {
    const willValidateCPF = get(envs.VALIDATE_CPF, true);
    if (willValidateCPF) {
      return cpfValidator.isValid(cpf);
    }
    return cpf.length === 11;
  }
  return false;
};

const messages = {
  cpf: {
    default: 'You must provide a valid CPF.',
  },
};

module.exports = {
  validateCPF,
  messages,
};
