const controller = {};

const helpers = require('../helpers/request/purchases');
const {
  jsonResponse, errorResponse, assembleError,
} = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');
const { userRoles } = require('../models/schemas/user');
const { statusTags } = require('../models/schemas/status');
const Purchases = require('../models/purchases');

controller.getAllPurchases = (req, res) => {
  const { cpf } = req.query;
  const { role } = req.user;
  if (role === userRoles.ADMIN) {
    Purchases.getAllPurchases(req.query,
      (error, purchases) => jsonResponse(error, { purchases }, res));
  } else {
    Purchases.getAllPurchasesByCPF(cpf, req.query,
      (error, purchases) => jsonResponse(error, { purchases }, res));
  }
};

controller.getAllPurchasesByCPF = (req, res) => {
  const { cpf } = req.params;
  Purchases.getAllPurchasesByCPF(cpf, req.query,
    (error, purchases) => jsonResponse(error, { purchases }, res));
};

controller.getOnePurchases = (req, res) => {
  const { id } = req.params;
  const { cpf, role } = req.user;
  Purchases.getOnePurchases(id,
    (error, purchase) => {
      if (error) {
        errorResponse(error, res);
      } else {
        const userPurchase = helpers.validateUserPurchase(purchase, role, cpf);
        jsonResponse(null, { purchase: userPurchase }, res);
      }
    });
};

controller.createPurchases = (req, res, next) => {
  const { body } = req;
  helpers.newPurchaseData(body, (err, newPurchase) => {
    if (err) next(err);
    else {
      Purchases.createPurchases(newPurchase,
        (error, purchases) => jsonResponse(error, { purchases }, res));
    }
  });
};

controller.updatePurchases = (req, res) => {
  Purchases.updatePurchases(req.params.id, req.body,
    (error, purchases) => jsonResponse(error, { purchases }, res));
};

controller.deletePurchases = (req, res) => {
  const { id } = req.params;
  const { cpf, role } = req.user;
  Purchases.getOnePurchases(id, (error, purchase) => {
    if (error) {
      errorResponse(error, res);
    } else {
      let errorDelete;
      const userPurchase = helpers.validateUserPurchase(purchase, role, cpf);
      if (!userPurchase) {
        errorDelete = assembleError({
          message: 'Purchase Not Found or Wrong Credentials!',
          statusCode: 422,
        });
      } else if (userPurchase.status.tag !== statusTags.EmValidacao) {
        errorDelete = assembleError({
          message: 'Can\'t Delete A Purchase Which Status Isn\'t "EM VALIDAÇÂO"!',
          statusCode: 422,
        });
      }
      if (errorDelete) {
        errorResponse(errorDelete, res);
      } else {
        Purchases.deletePurchases(id, (dError, deleted) => {
          const isDeleted = deleted && !isEmptyObject(deleted);
          jsonResponse(dError, { deleted: isDeleted || false }, res);
        });
      }
    }
  });
};

module.exports = controller;
