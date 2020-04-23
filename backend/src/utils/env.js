
const { logAPP } = require('./logger');

/**
 * Enumerates the current environment variables
 *
 * @readonly
 * @enum {String}
 */
const envs = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  APP_JWT_SECRET: 'APP_JWT_SECRET',
  JWT_EXPIRATION: 'JWT_EXPIRATION',
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_NAME: 'DATABASE_NAME',
  SEED_STATUS: 'SEED_STATUS',
  VALIDATE_CPF: 'VALIDATE_CPF',
  DEBUG_TAG: 'DEBUG_TAG',
  STRONG_PASSWORD: 'STRONG_PASSWORD',
  SPECIAL_CPF: 'SPECIAL_CPF',
  CASHBACK_API_URL: 'CASHBACK_API_URL',
  CASHBACK_API_TOKEN: 'CASHBACK_API_TOKEN',
};

/**
 * Get a value from process.env
 *
 * @param {String} envTag The name of the variable
 * @param {*} [defaultValue=null] Default value if not present in environment
 * @returns {*} Variable at process.env or defaultValue
 */
const get = (envTag, defaultValue = null) => process.env[envTag] || defaultValue;

/**
 * Check if environment variable matchs search
 *
 * @param {*} envTag The name of the variable
 * @param {*} search The value to compare
 * @param {*} [defaultValue=null] Default value if not present in environment
 * @returns {Boolean} True if matched
 */
const equals = (envTag, search, defaultValue = null) => get(envTag, defaultValue) === search;

/**
 * Return data allocated in process.env
 *
 * @param {*} [skipNpm=true] Skip any key that includes npm_
 * @param {*} [logData=false] Use logger function
 * @returns {{}} Returns the process.env data
 */
const print = (skipNpm = true, logData = true) => {
  const keys = Object.keys(process.env).filter((k) => (skipNpm ? !k.includes('npm_') : true)).sort();
  const toPrint = {};
  keys.forEach((k) => { toPrint[k] = get(k); });
  if (logData && logAPP && typeof logAPP === 'function') {
    logAPP(toPrint);
  }
  return toPrint;
};

module.exports = {
  envs,
  get,
  equals,
  print,
};
