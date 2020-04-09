const express = require('express');

const purchasesRouter = express.Router();

const middleware = require('../middlewares/purchases');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/purchases');

purchasesRouter.get('/',
  middleware.getAllValidator(),
  middleware.getAllIsValid,
  handleError(async (req, res, next) => {
    logRequest('GET ALL PURCHASES');
    controller.getAllPurchases(req, res, next);
  }));

purchasesRouter.get('/cpf/:cpf',
  middleware.cpfValidator(),
  middleware.cpfIsValid,
  middleware.getAllValidator(true),
  middleware.getAllIsValid,
  handleError(async (req, res, next) => {
    logRequest('GET ALL PURCHASES BY CPF');
    controller.getAllPurchasesByCPF(req, res, next);
  }));

purchasesRouter.get('/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  handleError(async (req, res, next) => {
    logRequest('GET ONE PURCHASE');
    controller.getOnePurchases(req, res, next);
  }));

purchasesRouter.post('/create',
  middleware.oneValidator(),
  middleware.oneIsValid,
  handleError(async (req, res, next) => {
    logRequest('CREATE ONE PURCHASE');
    controller.createPurchases(req, res, next);
  }));

purchasesRouter.put('/update/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  middleware.oneValidator(),
  middleware.oneIsValid,
  handleError(async (req, res, next) => {
    logRequest('UPDATE ONE PURCHASE');
    controller.updatePurchases(req, res, next);
  }));

purchasesRouter.delete('/delete/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  handleError(async (req, res, next) => {
    logRequest('DELETE AN PURCHASE');
    controller.deletePurchases(req, res, next);
  }));

module.exports = purchasesRouter;
