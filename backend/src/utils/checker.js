const moment = require('moment');

/**
 * Check if given object has any key
 *
 * @param {*} object Data to be checked
 * @returns {boolean} True if not "empty".
 *
 * @example
 * isEmptyObject({})
 * return true
 */
const isEmptyObject = (object) => {
  if (!object || typeof object !== 'object') return true;
  return Object.keys(object).length === 0;
};

/**
 * Check if given param is a callabe function
 *
 * @param {*} it Possible function/callback to be checked
 * @returns {boolean} True if is a function
 */
const isFunction = (it) => !!(it && it.constructor && it.call && it.apply);

/**
 * Check if given date1 is before date2
 * Compare always be done using:
 *
 * date1 -> start of day 00:00:00-000
 *
 * date2 -> end of day 23:59:59-999
 *
 * @param {String|Date|moment.Moment} date1 First date
 * @param {String|Date|moment.Moment} date2 Second date
 * @returns {boolean} True if date1 is before date2
 */
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
