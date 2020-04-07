
const mongoose = require('mongoose');
const PurchasesSchema = require('./schemas/purchases');
const helper = require('../helpers/models/purchases');
const { logDatabase } = require('../utils/logger');

const Purchases = mongoose.model('Purchases', PurchasesSchema);

// Methods
Purchases.getAllPurchases = (config, callback) => {
  logDatabase('QUERY: Executing findAll');
  Purchases.find(helper.assertFilter(config))
    .sort(helper.assertOrder(config))
    .limit(helper.assertLimit(config))
    .skip(helper.assertSkip(config))
    .populate('status')
    .exec(callback);
};

Purchases.getAllPurchasesByCPF = (cpf, config, callback) => {
  logDatabase('QUERY: Executing findAll by CPF');
  Purchases.find({ cpf, ...helper.assertFilter(config) })
    .sort(helper.assertOrder(config))
    .limit(helper.assertLimit(config))
    .skip(helper.assertSkip(config))
    .populate('status')
    .exec(callback);
};

Purchases.getOnePurchases = (id, callback) => {
  logDatabase('QUERY: Executing findOne');
  Purchases.findById(id).populate('status').exec(callback);
};

Purchases.createPurchases = (data, callback) => {
  logDatabase('MODEL: Executing create');
  Purchases.create(data, callback);
};

Purchases.updatePurchases = (id, data, callback) => {
  logDatabase('MODEL: Executing update');
  Purchases.findByIdAndUpdate(id, data, { new: true }).exec(callback);
};

Purchases.deletePurchases = (id, callback) => {
  logDatabase('MODEL: Executing deleteOne');
  Purchases.findByIdAndDelete(id).exec(callback);
};

module.exports = Purchases;
