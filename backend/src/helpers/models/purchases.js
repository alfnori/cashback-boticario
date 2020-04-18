
const { isEmptyObject } = require('../../utils/checker');
const { logDatabase } = require('../../utils/logger');
const {
  parseJSON, sanitize, transpileObject,
} = require('../../utils/transformer');

const { mongooseRegex, mongooseDatex } = require('./index');

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
    const dtx = mongooseDatex(null, filter.dateStart, filter.dateEnd, true);
    if (dtx) {
      resultFilter.date = dtx;
    }
  } else if (filter.date) {
    const dtx = mongooseDatex(filter.date, null, null, true);
    if (dtx) {
      resultFilter.date = dtx;
    }
  }
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
