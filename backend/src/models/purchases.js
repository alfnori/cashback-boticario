
const mongoose = require('mongoose');
const moment = require('moment');
const PurchasesSchema = require('./schemas/purchases');
const helper = require('../helpers/models/purchases');
const { mongooseDatex } = require('../helpers/models');
const { calculateCashback } = require('../helpers/business/purchases');
const { logDatabase, logError } = require('../utils/logger');

// Methods
PurchasesSchema.statics.getAllPurchases = function gap(config, callback) {
  logDatabase('QUERY: Executing findAll');
  this.find(helper.assertFilter(config))
    .sort(helper.assertOrder(config))
    .limit(helper.assertLimit(config))
    .skip(helper.assertSkip(config))
    .populate('status')
    .exec(callback);
};

PurchasesSchema.statics.getAllPurchasesByCPF = function gapc(cpf, config, callback) {
  logDatabase(`QUERY: Executing findAll by CPF: ${cpf}`);
  this.find({ cpf, ...helper.assertFilter(config) })
    .sort(helper.assertOrder(config))
    .limit(helper.assertLimit(config))
    .skip(helper.assertSkip(config))
    .populate('status')
    .exec(callback);
};

PurchasesSchema.statics.getOnePurchase = function gop(id, callback) {
  logDatabase('QUERY: Executing findOne');
  this.findById(id).populate('status').exec(callback);
};

PurchasesSchema.statics.updatePurchase = function upd(id, data, callback) {
  logDatabase('MODEL: Executing update');
  let updateData = { ...data };
  this.findById(id, async (error, toUpdate) => {
    if (error) callback(error);
    else {
      let cashback = { ...data.cashback };
      if (!cashback) {
        try {
          cashback = {}; // TODO await calculateCashback(toUpdate);
          updateData = { ...data, cashback };
        } catch (err) {
          logError('Failed to save cashback info.');
          logError(err);
        }
      }
      this.findByIdAndUpdate(id, updateData, { new: true })
        .populate('status')
        .exec(callback);
    }
  });
};

PurchasesSchema.statics.createPurchase = function crt(data, callback) {
  logDatabase('MODEL: Executing create');
  this.create(data, async (error, created) => {
    if (error) callback(error);
    else if (!created.cashback) {
      try {
        const cashback = {}; // TODO await calculateCashback(created);
        PurchasesSchema.updatePurchase(created.id, { cashback }, callback);
      } catch (err) {
        logError('Failed to save cashback info.');
        logError(err);
      }
    } else {
      callback(null, created);
    }
  });
};

PurchasesSchema.statics.deletePurchase = function del(id, callback) {
  logDatabase('MODEL: Executing deleteOne');
  this.findByIdAndDelete(id).exec(callback);
};

PurchasesSchema.statics.getPurchasesInPeriod = async function
gpip(startDate, endDate, cpf = null, filters = {}) {
  logDatabase('MODEL: Get all purchases from day month start to date');
  const mStart = moment(startDate);
  const mEnd = moment(endDate);
  if (!mStart || !mEnd || !mStart.isValid() || !mEnd.isValid()) {
    throw new Error('The given date was invalid!');
  }
  const period = mongooseDatex(null, mStart.toDate(), mEnd.toDate());
  // const statusFilter = filters.status || {};
  const queryFilters = { date: period, ...filters };
  delete queryFilters.status;
  if (cpf) {
    queryFilters.cpf = cpf;
  }
  let purchases;
  try {
    purchases = await this.find(queryFilters).populate('status');
  } catch (error) {
    purchases = [];
  }
  return purchases;
};

PurchasesSchema.statics.getPurchasesInMonthByStatus = async function
gpin(date, statusTag, cpf = null) {
  logDatabase('MODEL: Get all purchases from month and status');
  const mDate = moment(date);
  if (!mDate || !mDate.isValid()) {
    throw new Error('The given date was invalid!');
  }
  const startDate = mDate.clone().startOf('month').toDate();
  const endDate = mDate.clone().endOf('month').toDate();
  const statusFilter = { status: { tag: { $in: [statusTag] } } };
  let purchases;
  try {
    purchases = await this.getPurchasesInPeriod(startDate, endDate, cpf, statusFilter);
  } catch (error) {
    purchases = [];
  }
  return purchases;
};

const Purchases = mongoose.model('Purchases', PurchasesSchema);
module.exports = Purchases;
