const sanitizer = require('sanitizer');

const { isEmptyObject, isFunction } = require('./checker');
const { equals, envs } = require('./env');

/**
 * Parses a given json
 *
 * @param  {*} json Any possible json
 * @param  {*} [defaultValue={}] Default value
 * @returns {*} Parsed result of defaultvalue if error
 */
const parseJSON = (json, defaultValue = {}) => {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    parsed = defaultValue;
  }
  return parsed;
};

/**
 * Sanitizes an given string
 *
 * @param {String} str the string to be sanitezed
 * @param {String|RegExp} regex The string or regex to be replaced
 * @param {String} [replace=''] The string to be used on replaced regex
 * @returns {String} Returns sanitized string
 */
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

/**
 * Simple sanitazer espace
 *
 * @param {String} str The string to be escaped
 * @returns {String} Returns escaped string
 */
const sanitizerEscape = (str) => {
  try {
    return sanitizer.escape(str);
  } catch (e) {
    return '';
  }
};

/**
 * Callback `customValueCallback` to transform a given
 * `value` of the `key`on some `object`
 *
 * @callback customValueCallback
 * @param {Object} object The object of reference
 * @param {String} key The key inside of the object
 * @param {*} value The actual value of the key
 * @returns {*} Returns transformed value
 */

/**
 * Transpile an object to return an array of values or {key: value}
 *
 * @param {Object} object The object to be transformed to array
 * @param {customValueCallback} [customValue=undefined] The callback function
 * @param {*} onlyValue Tell function to return a plain value if `true`
 * or {key:value} if `false`
 * @returns {[*]} Returns an array with transpile values
 */
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

/**
 * Callback `callbackValue` to transform a given `value`
 *
 * @callback callbackValue
 * @param {*} value The actual value
 * @returns {*} Returns transformed value
 */

/**
 * Recompile an object from a given array
 *
 * @param {*} array The source item to recompile as object
 * @param {callbackValue} [callbackValue=null] The callback to transform the value
 * @param {String} [keyPath=''] The custom path to be used as key in the new object
 * @returns {Object} Returns the recompiled array as object
 */
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

/**
 * The configuration object to assemble a request error
 *
 * @typedef {Object} ConfigRequestError
 * @property {String} [message]     Error message
 * @property {String} [name]        Error name
 * @property {[*]}    [errors]      Array of errors
 * @property {Number} [statusCode]  Status code of error
 * @property {*}      [stackTrace]  Stack trace of error
 */

/**
 * A request error object
 *
 * @typedef {Object} RequestError
 * @property {String} message       Error message
 * @property {String} name          Error name
 * @property {[*]}    [errors]      Array of errors
 * @property {Number} [statusCode]  Status code of error
 * @property {*}      [stackTrace]  Stack trace of error
 */

/**
 * Assemble a request error object
 *
 * @param {ConfigRequestError} config The configuration data
 * @returns {RequestError} The assembled object
 */
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

/**
 * Transform any series of errors into an request error
 *
 * @param {*} rErrors Any request error object or array to be transformed
 * @returns {RequestError} The request error assembled
 */
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
