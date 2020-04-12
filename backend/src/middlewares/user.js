const { query, body } = require('express-validator');
const { validateRequest } = require('../helpers/request');
const { strongPassword } = require('../helpers/models/user');
const { sanitizeCpf, assertMatchCPF } = require('../helpers/middlewares');
const { logRequest } = require('../utils/logger');
const { validateCPF, messages } = require('../utils/validators');

const signInIsValid = (req, res, next) => {
  logRequest('EXECUTING LOGIN');
  logRequest(`FOR: ${req.body.email}`);
  return validateRequest(req, res, next);
};

const signUpIsValid = (req, res, next) => {
  logRequest('EXECUTING REGISTRATION');
  logRequest(`FOR: ${req.body.email}`);
  return validateRequest(req, res, next);
};

const signIN = () => [
  body('email').trim().isEmail(),
  body('password').trim().isLength({ min: 8 }),
];

const signUP = () => [
  body('name').trim().escape().isLength({ min: 3 }),
  body('cpf')
    .trim()
    .escape()
    .isLength({ min: 11 })
    .custom((value) => {
      if (!validateCPF(value)) {
        throw new Error(messages.cpf.default);
      }
      return true;
    }),
  body('email').trim().isEmail(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .custom((value) => {
      if (!strongPassword(value)) {
        throw new Error(
          'Weak password! Must contain at least: 1 uppcase, 1 lowercase, 1 number and 1 special character.',
        );
      }
      return true;
    }),
  body('passwordConfirm')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

const cashbackIsValid = (req, res, next) => {
  logRequest('EXECUTING CASHBACK BY CPF');
  logRequest(`FOR: ${req.query.cpf}`);
  return validateRequest(req, res, next);
};

const cashback = () => [
  query('cpf')
    .trim()
    .customSanitizer(sanitizeCpf)
    .custom(assertMatchCPF),
];

module.exports = {
  cashback,
  cashbackIsValid,
  signIN,
  signInIsValid,
  signUP,
  signUpIsValid,
};
