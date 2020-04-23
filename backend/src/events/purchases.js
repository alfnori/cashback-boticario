const { calculateCashbackInMonth } = require('../helpers/business/cashback/calculates');

/**
 * Update cashback information of month to a user
 * @param {*} PurchaseModel Database Schmema Model
 * @param {String|Date} date The reference date as month
 * @param {String} cpf The user document
 */
const updateCashBackInMonth = (PurchaseModel, date, cpf) => {
  setImmediate(async () => {
    const purchasesInMonth = await PurchaseModel.getPurchasesInMonth(date, cpf);
    const updatedWithCashback = calculateCashbackInMonth(purchasesInMonth);
    PurchaseModel.updateCashbackMultiPurchases(updatedWithCashback);
  });
};

module.exports = {
  updateCashBackInMonth,
};
