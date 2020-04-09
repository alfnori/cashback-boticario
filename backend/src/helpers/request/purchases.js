
const { validatorCPF } = require('../../utils/validators');
const { statusTags } = require('../../models/schemas/status');
const { userRoles } = require('../../models/schemas/user');
const { assembleError, errorResponse } = require('./index');
const { envs, get } = require('../../utils/env');
const Status = require('../../models/status');


const PurchaseErrors = {
  NotOwnerOrAdmin: 'NotOwnerOrAdmin',
  CantDeleteNotEV: 'userNotFound',
  CantUpdateNotEV: 'userNotFound',
};

const getError = (errorType) => {
  switch (errorType) {
    case PurchaseErrors.NotOwnerOrAdmin:
      return assembleError({
        message: 'Purchase Not Found or Wrong Credentials!',
        statusCode: 403,
      });
    case PurchaseErrors.CantDeleteNotEV:
      return assembleError({
        message: 'Can\'t Delete A Purchase Which Status Isn\'t "EM VALIDAÇÂO"!',
        statusCode: 422,
      });
    case PurchaseErrors.CantUpdateNotEV:
      return assembleError({
        message: 'Can\'t Update A Purchase Which Status Isn\'t "EM VALIDAÇÂO"!',
        statusCode: 422,
      });
    default:
      return assembleError({ error: errorType });
  }
};

const purchaseErrorResponse = (errorType, res, param = '') => {
  const aError = getError(errorType, param);
  errorResponse(aError, res);
};

const validateUserPurchase = (purchase, role, cpf) => {
  if (purchase && purchase.cpf) {
    if (role !== userRoles.ADMIN) {
      const purchaseCPF = validatorCPF.strip(purchase.cpf);
      const userCPF = validatorCPF.strip(cpf);
      if (purchaseCPF !== userCPF) {
        return false;
      }
    }
  }
  return (purchase && purchase.cpf);
};

const newPurchaseData = (purchaseData, callback) => {
  const newPurchase = { ...purchaseData };
  let newStatus = statusTags.EmValidacao;
  if (newPurchase.cpf === validatorCPF.strip(get(envs.SPECIAL_CPF, '153.509.460-56'))) {
    newStatus = statusTags.Aprovado;
  }
  Status.findByTag(newStatus, (err, status) => {
    if (err) callback(err);
    else {
      newPurchase.status = status;
      callback(null, newPurchase);
    }
  });
};

module.exports = {
  PurchaseErrors,
  purchaseErrorResponse,
  validateUserPurchase,
  newPurchaseData,
};
