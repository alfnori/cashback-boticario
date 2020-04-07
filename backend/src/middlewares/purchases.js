const { query, param, body } = require('express-validator');
const { validateRequest } = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');
const { parseJSON, sanitize } = require('../utils/transformer');
const { logRequest } = require('../utils/logger');
const { validatorCPF, validateCode } = require('../utils/validators');
const { statusTags } = require('../models/schemas/status');
const { userRoles } = require('../models/schemas/user');

const defaultLimit = 100;
const defaultSkip = 0;
const defaultPage = 1;
const minSearchLength = 3;

const sanitizeCpf = (value, { req }, defaultToToken = true) => {
  const tokenCPF = req.user.cpf;
  const cpf = value || (defaultToToken ? tokenCPF : null);
  if (cpf && validatorCPF.isValid(cpf)) {
    return validatorCPF.strip(cpf);
  }
  return null;
};

const assertMatchCPF = (value, { req }, optional = false) => {
  if (!optional && (validatorCPF.strip(value) !== validatorCPF.strip(req.user.cpf))) {
    if (req.user.role !== userRoles.ADMIN) {
      throw new Error('Informed CPF doesn\'t match with one in user token.');
    }
  }
  return true;
};

const getAllIsValid = (req, res, next) => {
  logRequest('GET ALL PURCHASE');
  logRequest(`CPF: ${req.query.cpf || '""'}`);
  logRequest(`FILTER: ${req.query.filter || '{}'}`);
  logRequest(`SEARCH: ${req.query.search || '""'}`);
  logRequest(`SORT: ${req.query.sort || '{}'}`);
  logRequest(`PAGE: ${req.query.page}`);
  logRequest(`LIMIT: ${req.query.limit}`);
  logRequest(`SKIP: ${req.query.skip}`);
  return validateRequest(req, res, next);
};

const getAllValidator = () => [
  query('cpf').optional()
    .customSanitizer((value, options) => sanitizeCpf(value, options))
    .custom((value, options) => assertMatchCPF(value, options)),
  query('filter').optional().isJSON(),
  query('search').optional().trim().isLength({ min: minSearchLength }),
  query('sort')
    .customSanitizer((value) => {
      let sort = parseJSON(value);
      if (isEmptyObject(sort) && value) {
        sort = { [sanitize(value, new RegExp(/\W/, 'g'))]: 'asc' };
      }
      return JSON.stringify(sort || {});
    })
    .optional()
    .isJSON(),
  query('page')
    .customSanitizer((value) => {
      let page = parseInt(value || defaultPage, 10);
      if (Number.isNaN(page) || page <= 0) page = defaultPage;
      return page;
    })
    .optional()
    .isInt(),
  query('limit')
    .customSanitizer((value) => {
      let limit = parseInt(value || defaultLimit, 10);
      if (Number.isNaN(limit) || limit <= 0) limit = defaultLimit;
      return limit;
    })
    .optional()
    .isInt(),
  query('skip')
    .customSanitizer((value) => {
      let skip = parseInt(value || defaultSkip, 10);
      if (Number.isNaN(skip) || skip < 0) skip = defaultSkip;
      return skip;
    })
    .optional()
    .isInt(),
];

const cpfIsValid = (req, res, next) => {
  logRequest(`CPF: ${req.params.cpf}`);
  return validateRequest(req, res, next);
};

const cpfValidator = () => [
  param('cpf').trim().customSanitizer(sanitizeCpf)
    .custom(assertMatchCPF)
    .isLength({ min: 11 }),
];

const idIsValid = (req, res, next) => {
  logRequest(`ID: ${req.params.id}`);
  return validateRequest(req, res, next);
};

const idValidator = () => [param('id').trim().isMongoId()];

const tagIsValid = (req, res, next) => {
  logRequest(`TAG: ${req.params.tag}`);
  return validateRequest(req, res, next);
};

const tagValidator = () => [param('tag').trim().isIn(Object.values(statusTags))];

const oneIsValid = (req, res, next) => {
  logRequest('PURCHASE');
  if (req.params.id) {
    logRequest(`ID: ${req.params.id}`);
  }
  logRequest(`DATA: ${JSON.stringify(req.body)}`);
  return validateRequest(req, res, next);
};

const oneValidator = () => [
  body('code').trim().exists().custom(validateCode),
  body('cpf').trim().customSanitizer(sanitizeCpf)
    .custom(assertMatchCPF)
    .isLength({ min: 11 }),
  body('date').trim().escape().isISO8601()
    .toDate(),
  body('value').trim().escape().isFloat()
    .toFloat(),
];

module.exports = {
  getAllValidator,
  getAllIsValid,
  idValidator,
  idIsValid,
  cpfValidator,
  cpfIsValid,
  tagValidator,
  tagIsValid,
  oneValidator,
  oneIsValid,
};
