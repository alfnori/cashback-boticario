const debug = require('debug');
const e = require('./env');

const TAG = e.get(e.envs.DEBUG_TAG, 'DEBUG').replace(':*', '');

const logger = debug(TAG);
const logAPP = logger.extend('APP');
const logDatabase = logger.extend('MONGO');
const logRequest = logger.extend('REQUEST');
const logError = logger.extend('ERROR');

// eslint-disable-next-line no-console
debug.log = console.log.bind(console);
debug('DEBUG')('Logger enabled!');

module.exports = {
  logAPP,
  logDatabase,
  logRequest,
  logError,
};
