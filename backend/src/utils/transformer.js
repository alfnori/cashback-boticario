const sanitizer = require('sanitizer');

const { isEmptyObject, isFunction } = require('./checker');
const { equals, envs } = require('./env');

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

const requestErrors = (config = {}) => {
  let error = {
    message: config.message || 'Invalid request',
    name: config.name || 'ValidationRequestError',
  };
  if (config.statusCode) {
    error.statusCode = config.statusCode;
  }
  if (config.errors) {
    error = { errors: config.errors, ...error };
  }
  if (config.stackTrace && equals(envs.NODE_ENV, 'development')) {
    error.stackTrace = config.stackTrace;
  }
  return error;
};

const transformRequestErrors = (rErrors) => {
  let error;
  let statusCode = null;
  if (rErrors && (rErrors.array || !isEmptyObject(rErrors))) {
    let errors;
    if (rErrors.array) {
      errors = rErrors.array();
    } else {
      errors = [rErrors];
      statusCode = rErrors.statusCode;
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
    error = requestErrors({
      errors: recompileObject(errorsAsArray, callbackRec),
      message: 'Invalid request',
      name: 'ValidationRequestError',
      statusCode,
    });
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
  requestErrors,
};
