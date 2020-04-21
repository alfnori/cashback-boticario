/* eslint-disable no-underscore-dangle */

const calc = require('./cashback/calculates');
const { getRule } = require('./cashback/rules');

class PurchaseNCashback {
  constructor(purchaseModel, purchase, rule = null) {
    this._rule = rule || getRule();
    this._model = purchaseModel;
    this._purchase = purchase;
    this._dates = {
      start: null,
      end: null,
    };
    this._purchasesBefore = [];
    this._cashback = null;
  }

  _calculdateDates() {
    const range = calc.calculateDateRange(this._purchase.date, this._rule);
    this._dates = {
      start: range.startDate,
      end: range.endDate,
    };
  }

  async _retrivePreviousPurchases() {
    const { cpf } = this._purchase;
    if (!this._dates.start || !this._dates.end) {
      this._calculdateDates();
    }
    const { start, end } = this._dates;
    const purchases = await this._model.getPurchasesInPeriod(start, end, cpf);
    this._purchasesBefore = purchases;
  }

  _calculateCashback() {
    const { _purchasesBefore, _purchase, _rule } = this;
    const cashback = calc.calculateCashback(_purchasesBefore, _purchase, _rule);
    this._cashback = cashback;
  }

  async init() {
    this._calculdateDates();
    await this._retrivePreviousPurchases();
    this._calculateCashback();
  }

  async getCashBack() {
    if (!this._cashback) {
      await this.init();
    }
    return this._cashback;
  }
}

module.exports = PurchaseNCashback;
