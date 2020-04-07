const { validationResult } = require('express-validator');
const { logRequest, logError } = require('../../utils/logger');
const { isEmptyObject } = require('../../utils/checker');
const { transformRequestErrors } = require('../../utils/transformer');

const assembleError = (data = {}) => transformRequestErrors({
  msg: data.message || data.msg || 'Invalid resource!',
  name: data.name || '',
  kind: data.kind || '',
  value: data.value || '',
  location: data.path || data.location || '',
  param: data.param || data.key || 'resource',
  statusCode: data.statusCode || null,
});

const validateRequest = (req, res, next) => {
  let error = validationResult(req);
  let nextRequest = next;
  if (error && error.isEmpty && !error.isEmpty()) {
    error = transformRequestErrors(error);
    // eslint-disable-next-line no-underscore-dangle
    delete error._message;
    error.statusCode = 422;
    res.status(422).send({ error });
    res.end();
    logRequest('Invalid Request!');
    nextRequest = null;
  }
  if (nextRequest) {
    nextRequest();
  }
};

const notFoundResponse = (req, res) => {
  logRequest(`Got 404 on ${req ? req.url : ''}`);
  res.status(404).send({ statusCode: 404, message: 'Invalid Resource!' });
};

const httpResponse = (data, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(data);
  res.end();
};

const jsonResponse = (error, entity, res) => {
  if (error && !isEmptyObject(error)) {
    res.status(error.statusCode || 500).send({ error });
    logError(error);
  } else {
    res.send(entity);
  }
};

const errorResponse = (error, res) => {
  jsonResponse(error, null, res);
};

module.exports = {
  assembleError,
  jsonResponse,
  errorResponse,
  validateRequest,
  notFoundResponse,
  httpResponse,
};
