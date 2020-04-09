
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const { assembleRequestError } = require('../helpers/request');
const { logError } = require('../utils/logger');
const jwtMiddleware = require('./jwt');

const criticalError = (err, req, res, next) => {
  if (err) {
    let error;
    if (err.name === 'UnauthorizedError') {
      error = assembleRequestError({
        message: 'Invalid Credentials!',
        name: 'UnauthorizedError',
        statusCode: 401,
        stackTrace: err.stack,
      });
    } else {
      error = assembleRequestError({
        message: err.message || 'Something got terrible wrong!',
        name: err.name || 'CriticalError',
        statusCode: 500,
        stackTrace: err.stack,
      });
      logError('CRITICAL FAILURE!');
      logError(error.message);
    }
    res.status(error.statusCode).send({ error });
  } else {
    next();
  }
};

const init = (app) => {
  app.use(morgan('combined', { skip(req, res) { return res.statusCode < 400; } }));
  app.use(morgan('tiny', { skip(req, res) { return res.statusCode > 400; } }));
  app.use(bodyParser.json());
  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
  });
  app.use(jwtMiddleware().unless({ path: [/\/auth\/\w*/i, /^\/$/i, /\/public\/\w*/i, /^\/$/i] }));
  app.use(criticalError);
};

module.exports = init;
