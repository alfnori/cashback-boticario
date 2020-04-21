const { calculateCashbackInMonth } = require('../helpers/business/cashback/calculates');

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
