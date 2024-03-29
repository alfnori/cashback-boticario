const { query, param, body } = require('express-validator');
const { validateRequest } = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');
const { parseJSON, sanitize } = require('../utils/transformer');
const { logRequest } = require('../utils/logger');
const { statusTags } = require('../models/schemas/status');
const { validateCode } = require('../utils/validators');
const { sanitizeCpf, assertMatchCPF, customOptional } = require('../helpers/middlewares');

const defaultLimit = 100;
const defaultSkip = 0;
const defaultPage = 1;
const minSearchLength = 3;

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

const getAllValidator = (skipCPFOnQuery = false) => [
  query('cpf')
    .trim()
    .customSanitizer(sanitizeCpf)
    .custom((v, o) => (skipCPFOnQuery ? true : assertMatchCPF(v, o))),
  query('filter').optional().isJSON(),
  query('search').optional().trim().isLength({ min: minSearchLength }),
  query('sort')
    .trim()
    .customSanitizer((value) => {
      let sort = parseJSON(value);
      if (isEmptyObject(sort) && value) {
        sort = { [sanitize(value, new RegExp(/\W/, 'g'))]: 'asc' };
      }
      return JSON.stringify(sort || {});
    })
    .custom(customOptional)
    .isJSON(),
  query('page')
    .trim()
    .customSanitizer((value) => {
      let page = parseInt(value || defaultPage, 10);
      if (Number.isNaN(page) || page <= 0) page = defaultPage;
      return page;
    })
    .custom(customOptional)
    .isInt(),
  query('limit')
    .trim()
    .customSanitizer((value) => {
      let limit = parseInt(value || defaultLimit, 10);
      if (Number.isNaN(limit) || limit <= 0) limit = defaultLimit;
      return limit;
    })
    .custom(customOptional)
    .isInt(),
  query('skip')
    .trim()
    .customSanitizer((value) => {
      let skip = parseInt(value || defaultSkip, 10);
      if (Number.isNaN(skip) || skip < 0) skip = defaultSkip;
      return skip;
    })
    .custom(customOptional)
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

const oneValidator = (skipCodeAndCPF = false) => [
  body('code')
    .trim()
    .custom((v, o) => (skipCodeAndCPF ? true : validateCode(v, o))),
  body('cpf')
    .trim()
    .customSanitizer(sanitizeCpf)
    .custom((v, o) => (skipCodeAndCPF ? true : v && (assertMatchCPF(v, o)))),
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
