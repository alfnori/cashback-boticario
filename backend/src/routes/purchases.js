const express = require('express');

const purchasesRouter = express.Router();

const middleware = require('../middlewares/purchases');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/purchases');

purchasesRouter.get('/',
  middleware.getAllValidator(),
  middleware.getAllIsValid,
  (req, res) => {
    logRequest('GET ALL PURCHASES');
    controller.getAllPurchases(req, res);
  });

purchasesRouter.get('/cpf/:cpf',
  middleware.cpfValidator(),
  middleware.cpfIsValid,
  middleware.getAllValidator(),
  middleware.getAllIsValid,
  (req, res) => {
    logRequest('GET ALL PURCHASES BY CPF');
    controller.getAllPurchasesByCPF(req, res);
  });

purchasesRouter.get('/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  (req, res) => {
    logRequest('GET ONE PURCHASE');
    controller.getOnePurchases(req, res);
  });

purchasesRouter.post('/create',
  middleware.oneValidator(),
  middleware.oneIsValid,
  (req, res) => {
    logRequest('CREATE ONE PURCHASE');
    controller.createPurchases(req, res);
  });

purchasesRouter.put('/update/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  middleware.oneValidator(),
  middleware.oneIsValid,
  (req, res) => {
    logRequest('UPDATE ONE PURCHASE');
    controller.updatePurchases(req, res);
  });

purchasesRouter.delete('/delete/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  (req, res) => {
    logRequest('DELETE AN PURCHASE');
    controller.deletePurchases(req, res);
  });

module.exports = purchasesRouter;
