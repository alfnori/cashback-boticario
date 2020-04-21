const moment = require('moment');

const isEmptyObject = (object) => {
  if (!object || typeof object !== 'object') return true;
  return Object.keys(object).length === 0;
};

const isFunction = (it) => !!(it && it.constructor && it.call && it.apply);

const isBeforeDate = (date1, date2) => {
  const mD1 = moment(date1).startOf('day');
  const mD2 = moment(date2).endOf('day');
  return mD1.isBefore(mD2);
};

module.exports = {
  isEmptyObject,
  isFunction,
  isBeforeDate,
};
