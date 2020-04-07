const sanitizer = require('sanitizer');

const { isEmptyObject, isFunction } = require('./checker');

const parseJSON = (json, defaultValue = {}) => {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    parsed = defaultValue;
  }
  return parsed;
};

const sanitize = (str, regex = undefined, replace = '') => {
  try {
    let sanitized = sanitizer.sanitize(str);
    if (regex) {
      sanitized = sanitized.replace(regex, replace || '');
    }
    return sanitized;
  } catch (e) {
    return '';
  }
};

const sanitizerEscape = (str) => {
  try {
    return sanitizer.escape(str);
  } catch (e) {
    return '';
  }
};

const transpileObject = (object, customValue = undefined, onlyValue = false) => {
  const transpile = Object.keys(object).map((key) => {
    let value = object[key];
    if (typeof customValue === 'function') {
      value = customValue(object, key, value);
    }
    if (onlyValue) return value;
    return { [key]: value };
  });
  return transpile;
};

const recompileObject = (array, callbackValue = null, keyPath = '') => {
  let object = {};
  const mapArray = array && Array.isArray(array) ? array : [array];
  mapArray.map((value, index) => {
    if (value) {
      if (Array.isArray(value)) {
        const matchedKey = `${(keyPath || 'property')}_${index}`;
        object[matchedKey] = isFunction(callbackValue) ? callbackValue(value) : value;
      } else if (!isEmptyObject(value)) {
        if (isFunction(callbackValue)) {
          Object.keys(value).map((propKey) => {
            const propVal = value[propKey];
            object[propKey] = isFunction(callbackValue) ? callbackValue(propVal) : propVal;
            return null;
          });
        } else {
          object = { ...object, ...value };
        }
      }
    }
    return null;
  });
  return object;
};

const transformRequestErrors = (requestErrors) => {
  let error;
  if (requestErrors && (requestErrors.array || !isEmptyObject(requestErrors))) {
    let errors = [requestErrors];
    if (requestErrors.array) {
      errors = requestErrors.array();
    }
    const errorsAsArray = errors.map((err) => ({ [err.param]: err }));
    const callbackRec = (err) => {
      const {
        value, msg, location, name, kind,
      } = err;
      return {
        message: msg || 'Invalid value',
        name: name || 'ValidatorError',
        kind: kind || 'invalidRequest',
        path: location || '',
        value: value || '',
      };
    };
    error = {
      errors: recompileObject(errorsAsArray, callbackRec),
      message: 'Invalid request',
      name: 'ValidationRequestError',
    };
  }
  if (requestErrors && !isEmptyObject(requestErrors) && requestErrors.statusCode) {
    error.statusCode = requestErrors.statusCode;
  }
  return error;
};

module.exports = {
  parseJSON,
  sanitize,
  sanitizerEscape,
  transpileObject,
  recompileObject,
  transformRequestErrors,
};
