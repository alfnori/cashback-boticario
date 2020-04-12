const { assembleError, jsonResponse, errorResponse } = require('./index');
const UserModel = require('../models/user');

const assembleData = (userData, token = null) => {
  const user = {
    name: userData.name,
    email: userData.email,
    cpf: userData.cpf,
    role: userData.role,
  };
  const data = { user };
  if (token) {
    data.token = token;
  }
  return data;
};

const UserErrors = {
  UserNotFound: 'userNotFound',
  PasswordDoesntMatch: 'userNotFound',
  InvalidUserToken: 'userNotFound',
};

const getError = (errorType, param = '') => {
  switch (errorType) {
    case UserErrors.UserNotFound:
      return assembleError({
        message: 'User Not Found!',
        param: 'email',
        path: 'body',
        value: param,
        statusCode: 401,
      });
    case UserErrors.PasswordDoesntMatch:
      return assembleError({
        message: "Password Doesn't Match!",
        param: 'password',
        path: 'body',
        value: param,
        statusCode: 401,
      });
    case UserErrors.InvalidUserToken:
      return assembleError({
        message: 'Invalid User from token!',
        param: 'token',
        path: 'header',
        statusCode: 403,
      });
    default:
      return assembleError({ error: errorType });
  }
};

const userResponse = (user, res) => {
  jsonResponse(null, assembleData(user), res);
};

const userTokenResponse = (user, res) => {
  const jwtToken = UserModel.generateJWT(user);
  const userWithToken = assembleData(user, jwtToken);
  jsonResponse(null, userWithToken, res);
};

const userErrorResponse = (errorType, res, param = '') => {
  const aError = getError(errorType, param);
  errorResponse(aError, res);
};

module.exports = {
  UserErrors,
  userResponse,
  userTokenResponse,
  userErrorResponse,
};
