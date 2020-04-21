const moment = require('moment');
const cashback = require('./rules');
const { isBeforeDate } = require('../../../utils/checker');

const getCurrentRule = cashback.getRule();

const calculateBonus = (bonus, bonusType, purchaseValue) => {
  switch (bonusType) {
    case cashback.bonusType.BRUTE:
      return bonus;
    case cashback.bonusType.PERCENTAGE:
      return (purchaseValue * bonus) / 100;
    default:
      return 0;
  }
};

const calculateRangeBonus = (valueAccumulated, rules = getCurrentRule) => {
  let rangeBonus = { bonus: null, bonusType: null };
  const cashbackRules = rules.cashback;
  for (let index = 0; index < cashbackRules.length; index += 1) {
    const range = cashbackRules[index];
    const {
      min, max, bonus, bonusType,
    } = range;
    const belowMax = min === -1 && valueAccumulated <= max;
    const aboveMin = max === -1 && valueAccumulated > min;
    const into = min > -1 && max >= min && valueAccumulated > min && valueAccumulated <= max;
    if (belowMax || aboveMin || into) {
      rangeBonus = { bonus, bonusType };
      break;
    }
  }
  return rangeBonus;
};

const calculateBonification = (valueAccumulated, purchaseValue, rules = getCurrentRule) => {
  const { bonus, bonusType } = calculateRangeBonus(valueAccumulated, rules);
  const value = calculateBonus(bonus, bonusType, purchaseValue);
  const fixedValue = Math.floor(value).toFixed(2);
  return { value: fixedValue, bonus, bonusType };
};

const calculateDateRange = (purchaseDate, rules = getCurrentRule) => {
  const mPurchaseDate = moment(purchaseDate);
  if (!mPurchaseDate || !mPurchaseDate.isValid()) {
    throw new Error('Invalid date provided!');
  }
  let startDate = mPurchaseDate.clone().startOf('day');
  let endDate = mPurchaseDate.clone().endOf('day');
  const { periodTypes } = cashback;
  switch (rules.periodType) {
    case periodTypes.MONTH_UNTIL_DATE:
      startDate = mPurchaseDate.startOf('month');
      break;
    case periodTypes.LAST_PERIOD: {
      const { range, rangeType } = rules.period;
      startDate = mPurchaseDate.subtract(range, rangeType);
      break;
    }
    default:
      startDate = mPurchaseDate.clone();
      endDate = mPurchaseDate.clone();
      break;
  }
  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
  };
};

const calculateCashback = (purchasesInRange, purchase, rules = getCurrentRule) => {
  let cashbackData = { value: null, bonus: null, bonusType: null };
  const { value } = purchase;
  if (purchasesInRange && purchasesInRange.length > 0) {
    const reducerValues = (acc, curr) => curr.value + acc;
    const valueAccumulated = purchasesInRange.reduce(reducerValues, 0);
    cashbackData = calculateBonification(valueAccumulated, value, rules);
  }

  return cashbackData;
};

const calculateCashbackInMonth = (purchasesInRange, rules = getCurrentRule) => {
  let assertedCashbacks = [];
  if (purchasesInRange && purchasesInRange.length > 0) {
    assertedCashbacks = purchasesInRange.map((purchase) => {
      const purchasesBefore = purchasesInRange.filter((p) => isBeforeDate(p.date, purchase.date));
      const cashbackData = calculateCashback(purchasesBefore, purchase, rules);
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
