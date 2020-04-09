const { validationResult } = require('express-validator');
const { logRequest, logError } = require('../../utils/logger');
const { isEmptyObject } = require('../../utils/checker');
const { transformRequestErrors, requestErrors } = require('../../utils/transformer');

const assembleError = (data = {}) => transformRequestErrors({
  msg: data.message || data.msg || data.error || 'Invalid resource!',
  name: data.name || '',
  kind: data.kind || '',
  value: data.value || '',
  location: data.path || data.location || '',
  param: data.param || data.key || 'resource',
  statusCode: data.statusCode || null,
});

const assembleRequestError = (data = {}) => requestErrors({
  errors: data.errors || null,
  message: data.message || data.msg || data.error || 'Invalid data received!',
  name: data.name || data.type || data.error || 'InvalidData',
  statusCode: data.code || data.statusCode || 400,
  stackTrace: data.stackTrace || data.stack || null,
});

const validateRequest = (req, res, next) => {
  let error = validationResult(req);
  let nextRequest = next;
  if (error && error.isEmpty && !error.isEmpty()) {
    error = transformRequestErrors(error);
    // eslint-disable-next-line no-underscore-dangle
    delete error._message;
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
  const error = assembleRequestError({
    message: 'Invalid Resource!',
    name: 'NotFound',
    statusCode: 404,
  });
  res.status(404).send({ error });
};

const httpResponse = (data, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(data);
  res.end();
};

const jsonResponse = (error, entity, res) => {
  if (error && !isEmptyObject(error)) {
    const err = { ...error };
    // eslint-disable-next-line no-underscore-dangle
    delete err._message;
    res.status(error.statusCode || 422).send({ error: err });
    logError(error);
  } else {
    res.send(entity);
  }
};

const errorResponse = (error, res) => {
  jsonResponse(error, null, res);
};

const handleError = (func) => (req, res, next) => {
  func(req, res, next).catch((err) => {
    const error = assembleRequestError({
      message: err.message || 'Something got terrible wrong!',
      name: err.name || 'CriticalError',
      statusCode: err.code || 500,
      stackTrace: err.stack,
    });
    logError('CRITICAL FAILURE!');
    logError(error.message);
    res.status(error.statusCode).send({ error });
  });
};

module.exports = {
  assembleError,
  assembleRequestError,
  jsonResponse,
  errorResponse,
  validateRequest,
  notFoundResponse,
  httpResponse,
  handleError,
};
