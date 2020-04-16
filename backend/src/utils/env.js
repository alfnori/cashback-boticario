
const { logAPP } = require('./logger');

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

const get = (envTag, defaultValue = null) => process.env[envTag] || defaultValue;
const equals = (envTag, search, defaultValue = null) => get(envTag, defaultValue) === search;
const print = (skipNpm = true, returnEnv = false) => {
  const keys = Object.keys(process.env).filter((k) => (skipNpm ? !k.includes('npm_') : true)).sort();
  const toPrint = {};
  keys.forEach((k) => { toPrint[k] = get(k); });
  if (!returnEnv && logAPP && typeof logAPP === 'function') {
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
