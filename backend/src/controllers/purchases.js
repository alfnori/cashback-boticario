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
  if (role !== userRoles.ADMIN) {
    req.query.filter = { ...req.query.filter, cpf };
  }
  Purchases.getAllPurchases(req.query, (error, purchases) => {
    if (error) {
      errorResponse(error, res);
    } else {
      Purchases.pagination(req.query, purchases.length, (err, pagination) => {
        jsonResponse(err, { purchases, pagination }, res);
      });
    }
  });
};

controller.getAllPurchasesByCPF = (req, res) => {
  const { cpf } = req.params;
  req.query.filter = { ...req.query.filter, cpf };
  Purchases.getAllPurchases(req.query, (error, purchases) => {
    if (error) {
      errorResponse(error, res);
    } else {
      Purchases.pagination(req.query, purchases.length, (err, pagination) => {
        jsonResponse(err, { purchases, pagination }, res);
      });
    }
  });
};

controller.getOnePurchase = async (req, res) => {
  const { id } = req.params;
  const { cpf, role } = req.user;
  Purchases.getOnePurchase(id,
    async (error, purchase) => {
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

controller.createPurchase = (req, res) => {
  const { body } = req;
  const newPurchase = newPurchaseData(body);
  Purchases.createPurchase(newPurchase, (error, created) => {
    jsonResponse(error, { purchase: created }, res);
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
