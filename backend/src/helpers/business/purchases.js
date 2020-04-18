const moment = require('moment');
const cashback = require('./cashbackRule');
// const { logError } = require('../../utils/logger');
const { isBeforeDate } = require('../../utils/checker');

const getCurrentRule = cashback.rule();

const calculateDateRange = (currentRule, purchaseDate) => {
  const mPurchaseDate = moment(purchaseDate);
  if (!mPurchaseDate || !mPurchaseDate.isValid()) {
    throw new Error('Invalid date provided!');
  }
  let startDate = mPurchaseDate.clone().startOf('day');
  let endDate = mPurchaseDate.clone().endOf('day');
  const { periodTypes } = cashback;
  switch (currentRule.periodType) {
    case periodTypes.MONTH_UNTIL_DATE:
      startDate = mPurchaseDate.startOf('month').toDate();
      break;
    case periodTypes.LAST_PERIOD: {
      const { range, rangeType } = currentRule.period;
      startDate = mPurchaseDate.subtract(range, rangeType);
      break;
    }
    default:
      startDate = startDate.toDate();
      endDate = endDate.toDate();
      break;
  }
  return {
    startDate,
    endDate,
  };
};

const calculateBonus = (bonus, bonusType, purchaseValue) => {
  switch (bonusType) {
    case cashback.bonusType.BRUTE:
      return bonus;
    case cashback.bonusType.PERCENTAGE:
      return purchaseValue * bonus;
    default:
      return 0;
  }
};

const calculateRangeBonus = (cashbackRules, valueAccumulated) => {
  let rangeBonus = { bonus: null, bonusType: null };
  for (let index = 0; index < cashbackRules.length; index += 1) {
    const range = cashbackRules[index];
    const {
      min, max, bonus, bonusType,
    } = range;
    if (
      (min === -1 && valueAccumulated <= max)
      || (max === -1 && valueAccumulated > min)
      || (min > -1 && max >= min && valueAccumulated > min && valueAccumulated <= max)
    ) {
      rangeBonus = { bonus, bonusType };
      break;
    }
  }
  return rangeBonus;
};

const calculateBonification = (rule, valueAccumulated, purchaseValue) => {
  const { bonus, bonusType } = calculateRangeBonus(rule, valueAccumulated);
  const value = calculateBonus(bonus, bonusType, purchaseValue);
  return { value, bonus, bonusType };
};

const calculateCashback = (purchasesInRange, purchase, rule = getCurrentRule) => {
  let cashbackData = { value: null, bonus: null, bonusType: null };
  const { value } = purchase;
  if (purchasesInRange && purchasesInRange.length > 0) {
    const reducerValues = (acc, curr) => curr.value + acc;
    const valueAccumulated = purchasesInRange.reduce(reducerValues, 0);
    cashbackData = calculateBonification(rule, valueAccumulated, value);
  }
  return cashbackData;
};

const calculateCashbackInMonth = (purchasesInRange, rule = getCurrentRule) => {
  let assertedCashbacks = [];
  if (purchasesInRange && purchasesInRange.length > 0) {
    assertedCashbacks = purchasesInRange.map((purchase) => {
      const purchasesBefore = purchasesInRange.filter((p) => isBeforeDate(purchase.date, p.date));
      const cashbackData = calculateCashback(purchasesBefore, purchase, rule);
      const purchaseWithCashback = { ...purchase, cashback: cashbackData };
      return purchaseWithCashback;
    });
  }
  return assertedCashbacks;
};

module.exports = {
  calculateDateRange,
  calculateCashback,
  calculateCashbackInMonth,
};
