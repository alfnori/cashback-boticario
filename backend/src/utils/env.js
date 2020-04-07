
const envs = {
  PORT: 'PORT',
  APP_JWT_SECRET: 'APP_JWT_SECRET',
  JWT_EXPIRATION: 'JWT_EXPIRATION',
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_NAME: 'DATABASE_NAME',
  VALIDATE_CPF: 'VALIDATE_CPF',
  DEBUG_TAG: 'DEBUG_TAG',
  STRONG_PASSWORD: 'STRONG_PASSWORD',
  SPECIAL_CPF: 'SPECIAL_CPF',
};

const get = (envTag, defaultValue = null) => process.env[envTag] || defaultValue;

module.exports = {
  envs,
  get,
};
