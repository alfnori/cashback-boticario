const controller = {};

const { jsonResponse, errorResponse } = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');
const { envs, get } = require('../utils/env');
const { validatorCPF } = require('../utils/validators');
const { statusTags } = require('../models/schemas/status');
const { userRoles } = require('../models/schemas/user');
const Purchases = require('../models/purchases');
const Status = require('../models/status');

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
        let userPurchase = purchase;
        if (userPurchase && userPurchase.cpf) {
          if (role !== userRoles.ADMIN) {
            const purchaseCPF = validatorCPF.strip(purchase.cpf);
            const userCPF = validatorCPF.strip(cpf);
            if (purchaseCPF !== userCPF) {
              userPurchase = null;
            }
          }
        }
        jsonResponse(null, { purchase: userPurchase }, res);
      }
    });
};

controller.createPurchases = (req, res) => {
  const { body } = req;
  let newStatus = statusTags.EmValidacao;
  if (body.cpf === validatorCPF.strip(get(envs.SPECIAL_CPF, '153.509.460-56'))) {
    newStatus = statusTags.Aprovado;
  }
  Status.findByTag(newStatus, (sError, sStatus) => {
    if (sError) {
      errorResponse(sError, res);
    } else {
      body.status = sStatus;
      Purchases.createPurchases(body,
        (error, purchases) => jsonResponse(error, { purchases }, res));
    }
  });
};

controller.updatePurchases = (req, res) => {
  Purchases.updatePurchases(req.params.id, req.body,
    (error, purchases) => jsonResponse(error, { purchases }, res));
};

controller.deletePurchases = (req, res) => {
  Purchases.deletePurchases(req.params.id, (error, deleted) => {
    const isDeleted = deleted && !isEmptyObject(deleted);
    jsonResponse(error, { deleted: isDeleted || false }, res);
  });
};

module.exports = controller;
