/**
 ==================================================================
 Premissas do caso de uso:
 ==================================================================
 Os critérios de bonificação são:
 ------------------------------------------------------------------
 - Para até 1.000 reais em compras, o revendedor(a) receberá:
 10% de cashback do valor vendido no período;
 - Entre 1.000 e 1.500 reais em compras, o revendedor(a) receberá:
 15% de cashback do valor vendido no período;
 - Acima de 1.500 reais em compras, o revendedor(a) receberá:
 20% de cashback do valor vendido no período.
 - Período: (30days?)
 ==================================================================
*/

const { get, envs } = require('../../utils/env');
const { parseJSON } = require('../../utils/transformer');

const PERIOD_TYPES = {
  MONTH_UNTIL_DATE: 'MONTH_UNTIL_DATE',
  LAST_PERIOD: 'LAST_PERIOD',
};

const BONUS_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  BRUTE: 'BRUTE',
};

const defaultCashback = [
  {
    min: -1, max: 1000, bonus: 10, bonusType: BONUS_TYPE.PERCENTAGE,
  },
  {
    min: 1000, max: 1500, bonus: 15, bonusType: BONUS_TYPE.PERCENTAGE,
  },
  {
    min: 1500, max: -1, bonus: 20, bonusType: BONUS_TYPE.PERCENTAGE,
  },
];
const defaultPeriod = { range: 30, rangeType: 'days' };
const defaultRule = {
  periodType: PERIOD_TYPES.MONTH_UNTIL_DATE,
  period: defaultPeriod,
  cashback: defaultCashback,
};

/**
 * @returns { defaultRule } as current rule
 */
const getCashbackRules = () => {
  const rule = get(envs.CASHBACK_RULE, '{}');
  let rules = parseJSON(rule, {});
  if (!rules || !rules.periodType || !PERIOD_TYPES[rules.periodType]) {
    rules = defaultRule;
  }
  if (rules.periodType === PERIOD_TYPES.LAST_PERIOD) {
    if (!rules.period || !rules.period.range || !rules.period.rangeType) {
      rules.period = defaultPeriod;
    }
  }
  if (!rules.cashback || !Array.isArray(rules.cashback)) {
    rules.cashback = defaultCashback;
  } else {
    const requiredCount = rules.cashback.length;
    const reducerBonus = (acc, curr) => {
      const val = (curr.bonus && curr.bonusType) ? 1 : 0;
      return acc + val;
    };
    const hasBonusAndType = rules.cashback.reduce(reducerBonus, 0);
    if (hasBonusAndType !== requiredCount) {
      rules.cashback = defaultCashback;
    }
  }
  return rules;
};

module.exports = {
  rule: getCashbackRules,
  periodTypes: PERIOD_TYPES,
  bonusType: BONUS_TYPE,
};
