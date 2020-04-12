const { validatorCPF } = require('../../utils/validators');
const { userRoles } = require('../../models/schemas/user');

const sanitizeCpf = (value, { req }) => {
  const tokenCPF = req.user.cpf;
  const defaultToToken = req.user.role === userRoles.USER;
  const cpf = value || (defaultToToken ? tokenCPF : null);
  if (cpf && validatorCPF.isValid(cpf)) {
    return validatorCPF.strip(cpf);
  }
  return null;
};

const assertMatchCPF = (value, { req }) => {
  const skipValidation = req.user.role === userRoles.ADMIN;
  if (!skipValidation) {
    if (!value) {
      throw new Error('The field CPF must be informed.');
    } else if (validatorCPF.strip(value) !== validatorCPF.strip(req.user.cpf)) {
      throw new Error("Informed CPF doesn't match with one in user token.");
    }
  }
  return true;
};

const customOptional = (value, { req }) => value || req;

module.exports = {
  sanitizeCpf,
  assertMatchCPF,
  customOptional,
};
