
const controller = {};

const { jsonResponse, errorResponse } = require('../helpers/request');
const { isEmptyObject } = require('../utils/checker');
const { envs, get } = require('../utils/env');
const Purchases = require('../models/purchases');
const { Status, statusTags } = require('../models/status');

controller.getAllPurchases = (req, res) => {
  Purchases.getAllPurchases(req.query,
    (error, purchases) => jsonResponse(error, { purchases }, res));
};

controller.getAllPurchasesByCPF = (req, res) => {
  const { cpf } = req.params;
  Purchases.getAllPurchasesByCPF(cpf, req.query,
    (error, purchases) => jsonResponse(error, { purchases }, res));
};

controller.getOnePurchases = (req, res) => {
  Purchases.getOnePurchases(req.params.id,
    (error, purchases) => jsonResponse(error, { purchases }, res));
};

controller.createPurchases = (req, res) => {
  const { body } = req;
  let newStatus = statusTags.EmValidacao;
  if (body.cpf === get(envs.SPECIAL_CPF)) {
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
  Purchases.deletePurchases(req.params.id,
    (error, deleted) => {
      const isDeleted = (deleted && !isEmptyObject(deleted));
      jsonResponse(error, { deleted: isDeleted || false }, res);
    });
};

module.exports = controller;
