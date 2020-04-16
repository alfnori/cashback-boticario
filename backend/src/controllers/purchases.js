const controller = {};

const {
  validateUserPurchase, newPurchaseData, PurchaseErrors, purchaseErrorResponse,
} = require('../helpers/request/purchases');
const {
  jsonResponse, errorResponse,
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

controller.getOnePurchase = (req, res) => {
  const { id } = req.params;
  const { cpf, role } = req.user;
  Purchases.getOnePurchase(id,
    (error, purchase) => {
      if (error) {
        errorResponse(error, res);
      } else if (!purchase) {
        jsonResponse(null, { purchase }, res);
      } else {
        const userPurchase = validateUserPurchase(purchase, role, cpf);
        if (!userPurchase) {
          purchaseErrorResponse(PurchaseErrors.NotOwnerOrAdmin, res);
        } else {
          jsonResponse(null, { purchase }, res);
        }
      }
    });
};

controller.createPurchase = (req, res, next) => {
  const { body } = req;
  newPurchaseData(body, (err, newPurchase) => {
    if (err) next(err);
    else {
      Purchases.createPurchase(newPurchase, (error, created) => {
        jsonResponse(error, { purchase: created }, res);
      });
    }
  });
};

controller.updatePurchase = (req, res) => {
  const { id } = req.params;
  const { cpf, role } = req.user;
  Purchases.getOnePurchase(id, (error, purchase) => {
    if (error) {
      errorResponse(error, res);
    } else {
      const userPurchase = validateUserPurchase(purchase, role, cpf);
      if (!userPurchase) {
        purchaseErrorResponse(PurchaseErrors.NotOwnerOrAdmin, res);
      } else if (!purchase.status || (purchase.status.tag !== statusTags.EmValidacao)) {
        purchaseErrorResponse(PurchaseErrors.CantUpdateNotEV, res);
      } else {
        const { body } = req;
        const updateFields = { date: body.date, value: body.value };
        Purchases.updatePurchase(id, updateFields, (err, updated) => {
          jsonResponse(err, { purchase: updated }, res);
        });
      }
    }
  });
};

controller.deletePurchase = (req, res) => {
  const { id } = req.params;
  const { cpf, role } = req.user;
  Purchases.getOnePurchase(id, (error, purchase) => {
    if (error) {
      errorResponse(error, res);
    } else {
      const userPurchase = validateUserPurchase(purchase, role, cpf);
      if (!userPurchase) {
        purchaseErrorResponse(PurchaseErrors.NotOwnerOrAdmin, res);
      } else if (!purchase.status || (purchase.status.tag !== statusTags.EmValidacao)) {
        purchaseErrorResponse(PurchaseErrors.CantDeleteNotEV, res);
      } else {
        Purchases.deletePurchase(id, (dError, deleted) => {
          const isDeleted = deleted && !isEmptyObject(deleted);
          jsonResponse(dError, { deleted: isDeleted || false }, res);
        });
      }
    }
  });
};

module.exports = controller;
