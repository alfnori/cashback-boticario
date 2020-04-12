
const moment = require('moment');
const { isEmptyObject } = require('../../utils/checker');
const { logDatabase } = require('../../utils/logger');
const {
  parseJSON, sanitize, sanitizerEscape, transpileObject,
} = require('../../utils/transformer');

const mongooseRegex = (str) => ({ $regex: new RegExp(sanitizerEscape(str)), $options: 'ig' });
const mongooseDatex = (date, startDate = null, endDate = null) => {
  const startDefault = new Date(1900, 0, 1, 0, 0, 0, 0);
  const endDefault = new Date(2900, 0, 1, 0, 0, 0, 0);
  let start = startDefault;
  let end = endDefault;
  try {
    if (startDate && endDate) {
      const mStart = moment(startDate);
      const mEnd = moment(endDate);
      if (mStart.isValid() && mEnd.isValid()) {
        start = mStart.toDate();
        end = mEnd.toDate();
      }
    } else {
      const mDate = moment(date);
      if (mDate.isValid()) {
        start = mDate.startOf('day').toDate();
        end = mDate.endOf('day').toDate();
      }
    }
  } catch (err) {
    start = null;
    end = null;
  }
  if ((start === null || end === null)) {
    start = startDefault;
    end = endDefault;
  }
  return ({ $gte: start, $lt: end });
};

const assertFilter = (config) => {
  if (!config || (!config.filter && !config.search)) return {};
  const search = sanitize(config.search);
  let filter;
  if (search) {
    filter = {
      code: search,
      cpf: search,
      date: search,
    };
  } else {
    filter = parseJSON(config.filter, {});
  }
  let resultFilter = {};
  if (filter.code) resultFilter.code = mongooseRegex(filter.code);
  if (filter.dateStart && filter.dateEnd) {
    resultFilter.date = mongooseDatex(null, filter.dateStart, filter.dateEnd);
  } else if (filter.date) resultFilter.date = mongooseDatex(filter.date);
  if (filter.cpf) resultFilter.cpf = mongooseRegex(filter.cpf.replace(/[^\w]/g, ''));
  if (isEmptyObject(resultFilter)) return {};
  if (search) {
    resultFilter = { $or: transpileObject(resultFilter) };
  } else {
    resultFilter = { $and: transpileObject(resultFilter) };
  }
  logDatabase(`FILTER: ${JSON.stringify(resultFilter)}`);
  return resultFilter;
};

const assertOrder = (config) => {
  if (!config || !config.sort) return {};
  const sort = parseJSON(config.sort);
  let resultSort = transpileObject(sort,
    (o, k, v) => {
      const availableSort = ['cpf', 'code', 'date', 'value'].indexOf(k) >= 0;
      const availableSortType = ['asc', 'desc', 'ascending', 'descending', 1, -1].indexOf(v) >= 0;
      if (availableSort && availableSortType) {
        return [k, v];
      }
      return undefined;
    }, true);
  resultSort = resultSort.filter(Boolean);
  logDatabase(`SORT: ${JSON.stringify(resultSort)}`);
  return resultSort;
};

const assertLimit = (config) => {
  const limit = parseInt(config.limit, 10);
  logDatabase(`LIMIT: ${limit}`);
  return limit;
};

const assertSkip = (config) => {
  let skip = parseInt(config.skip, 10);
  const page = parseInt(config.page, 10);
  if (page > 1) {
    const limit = assertLimit(config);
    skip = (page - 1) * limit;
  }
  logDatabase(`SKIP: ${skip}`);
  return skip;
};

module.exports = {
  assertFilter,
  assertOrder,
  assertLimit,
  assertSkip,
};
