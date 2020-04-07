const debug = require('debug');
const e = require('./env');

const DEBUG_TAG = (name) => `${(e.get(e.envs.DEBUG_TAG, 'DEBUG')).replace(':*', '')}:${name}`;

const logger = debug(DEBUG_TAG('APP'));
const logDatabase = debug(DEBUG_TAG('MONGO'));
const logRequest = debug(DEBUG_TAG('REQUEST'));
const logError = debug(DEBUG_TAG('ERROR'));

// eslint-disable-next-line no-console
debug.log = console.log.bind(console);

module.exports = {
  logger,
  logDatabase,
  logRequest,
  logError,
};
