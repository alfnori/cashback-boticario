const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { envs, get } = require('../../utils/env');

const saltRounds = 10;
const appSecretJWT = get(envs.APP_JWT_SECRET);
const expirationTime = '1y'; // get(envs.JWT_EXPIRATION, '7d'); // Long for testing only

const strongPassword = (password) => {
  if (Boolean(get(envs.STRONG_PASSWORD, true)) === false) {
    return password && password.length >= 6;
  }
  const strongRegex = new RegExp(/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/, 'g');
  return strongRegex.test(password || '');
};

const generateSecrets = (password, callback) => {
  if (!password || password.length < 8) throw new Error('Invalid password!');
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) callback(err);
    bcrypt.hash(password, salt, (error, encypted) => callback(error, { salt, password: encypted }));
  });
};

const compareSecrets = (password, encrypted, callback) => {
  bcrypt.compare(password, encrypted, callback);
};

const generateJWT = (user) => {
  const userData = {
    name: user.name,
    cpf: user.cpf,
    email: user.email,
    role: user.role,
  };
  const signature = appSecretJWT;
  const expiresIn = expirationTime;
  return jwt.sign(
    userData,
    signature,
    { expiresIn },
  );
};

module.exports = {
  appSecretJWT,
  strongPassword,
  generateSecrets,
  compareSecrets,
  generateJWT,
};
