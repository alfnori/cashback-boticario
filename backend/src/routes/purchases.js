const express = require('express');

/**
 * @classdesc Purchases Router
 * @name RouterPurchases
 * @class
 */
const purchasesRouter = express.Router();

const middleware = require('../middlewares/purchases');
const { handleError } = require('../helpers/request');
const { logRequest } = require('../utils/logger');

const controller = require('../controllers/purchases');

/**
 * @name getAll Get all purchases
 */
purchasesRouter.get('/',
  middleware.getAllValidator(),
  middleware.getAllIsValid,
  handleError(async (req, res, next) => {
    logRequest('GET ALL PURCHASES');
    controller.getAllPurchases(req, res, next);
  }));

/**
 * @name getByCPF Get all purchases by CPF
 * @param {String} cpf The given document
 */
purchasesRouter.get('/cpf/:cpf',
  middleware.cpfValidator(),
  middleware.cpfIsValid,
  middleware.getAllValidator(true),
  middleware.getAllIsValid,
  handleError(async (req, res, next) => {
    logRequest('GET ALL PURCHASES BY CPF');
    controller.getAllPurchasesByCPF(req, res, next);
  }));

/**
 * @name getByID Get a purchase by ID
 * @param {String} id The given identification
 */
purchasesRouter.get('/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  handleError(async (req, res, next) => {
    logRequest('GET ONE PURCHASE');
    controller.getOnePurchase(req, res, next);
  }));


/**
 * @name create Creates a purchase
 */
purchasesRouter.post('/create',
  middleware.oneValidator(),
  middleware.oneIsValid,
  handleError(async (req, res, next) => {
    logRequest('CREATE ONE PURCHASE');
    controller.createPurchase(req, res, next);
  }));

/**
 * @name update Updates purchase with ID
 * @param {String} id The given identification
 */
purchasesRouter.put('/update/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  middleware.oneValidator(true),
  middleware.oneIsValid,
  handleError(async (req, res, next) => {
    logRequest('UPDATE ONE PURCHASE');
    controller.updatePurchase(req, res, next);
  }));

/**
 * @name delete Deletes purchase with ID
 * @param {String} id The given identification
 */
purchasesRouter.delete('/delete/:id',
  middleware.idValidator(),
  middleware.idIsValid,
  handleError(async (req, res, next) => {
    logRequest('DELETE AN PURCHASE');
    controller.deletePurchase(req, res, next);
  }));

module.exports = purchasesRouter;
