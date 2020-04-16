const moment = require('moment');
const cashback = require('./cashbackRule');
const { logError } = require('../../utils/logger');
const { statusTags } = require('../../models/schemas/status');
const Purchases = require('../../models/purchases');
const Status = require('../../models/status');

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

const calculateCashback = async (purchase, rule = getCurrentRule) => {
  let cashbackData = { value: null, bonus: null, bonusType: null };
  const { cpf, date, value } = purchase;
  const { startDate, endDate } = calculateDateRange(rule, date);
  try {
    const purchasesInRange = await Purchases.getPurchasesInPeriod(cpf, startDate, endDate);
    if (purchasesInRange && purchasesInRange.length > 0) {
      const reducerValues = (acc, curr) => curr.value + acc;
      const valueAccumulated = purchasesInRange.reduce(reducerValues, 0);
      cashbackData = calculateBonification(rule, valueAccumulated, value);
    }
  } catch (error) {
    logError(error);
    throw error;
  }
  return cashbackData;
};

const assertCashbackFromMonth = async (cpf, date, rule = getCurrentRule) => {
  const mDate = moment(date);
  if (!mDate || !mDate.isValid()) {
    throw new Error('Invalid date provided!');
  }
  const startDate = mDate.clone().startOf('month').toDate();
  const endDate = mDate.clone().endOf('month').toDate();
  const inValidationStatus = await Status.findByTagAsync(statusTags.EmValidacao);
  const filter = { status: inValidationStatus.id };
  try {
    const purchasesInRange = await Purchases
      .getPurchasesInPeriod(cpf, startDate, endDate, filter);
    if (purchasesInRange && purchasesInRange.length > 0) {
      await Promise.all(
        purchasesInRange.map(async (purchase) => {
          const cashbackData = await calculateCashback(purchase, rule);
          await Purchases
            .findByIdAndUpdate(purchase.id, { cashback: cashbackData });
        }),
      );
    }
  } catch (error) {
    logError(error);
    throw error;
  }
};

module.exports = {
  calculateCashback,
  assertCashbackFromMonth,
};
