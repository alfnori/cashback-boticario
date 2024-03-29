const unless = require('express-unless');
const jwt = require('express-jwt');

const UserModel = require('../models/user');
const { appSecretJWT } = require('../helpers/models/user');

const { isEmptyObject } = require('../utils/checker');

const assertTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

const isRevokedCallback = (req, payload, done) => {
  const { cpf, email, role } = payload;
  UserModel.findOne({ cpf, email, role }, (err, user) => {
    if (err) { return done(err); }
    return done(null, isEmptyObject(user));
  });
};

const assertJWT = jwt({
  secret: appSecretJWT,
  credentialsRequired: true,
  getToken: assertTokenFromHeader,
  isRevoked: isRevokedCallback,
});

module.exports = () => {
  const jwtMiddleware = assertJWT;
  jwtMiddleware.unless = unless;
  return jwtMiddleware;
};
