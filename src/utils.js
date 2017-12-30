import Constants from './constants';
import ErrorManager from './errorManager';
import StorageManager from './storageManager';

var logLevels = {
  DISABLE: 0,
  ERROR: 1,
  INFO: 2,
  DEBUG: 3,
};

let logLevel = logLevels.INFO;

const setLogLevel = function setLogLevel(level) {
  logLevel = level;
};

const getLogLevel = function getLogLevel() {
  return logLevel;
};

const log = {
  error: (m) => {
    if (logLevel >= logLevels.ERROR) {
      _log('error', m);
    }
  },

  info: (m) => {
    if (logLevel >= logLevels.INFO) {
      _log('log', m);
    }
  },

  debug: (m) => {
    if (logLevel >= logLevels.DEBUG) {
      _log('debug', m);
    }
  },
};

const _log = (level, m) => {
  if (window.console) {
    try {
      let ts = new Date().getTime();
      console[level](`CleverTap [${ts}]: ${m}`);
    } catch (e) {
      // no-op
    }
  }
};

//expecting  yyyymmdd format either as a number or a string
const setDate = function (dt) {
    if (isDateValid(dt)) {
        return "$D_" + dt;
    }
    log.error(ErrorManager.MESSAGES.dateFormat);
};

const isDateObject = function (input) {
    return typeof(input) === "object" && (input instanceof Date);
};

const convertToWZRKDate = function (dateObj) {
    return ("$D_" + Math.round(dateObj.getTime() / 1000) );
};

const isDateValid = function (date) {
    var matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    if (matches === null) {
      return false;
    }

    var d = matches[3];
    var m = matches[2] - 1;
    var y = matches[1];
    var composedDate = new Date(y, m, d);
    return composedDate.getDate() === d &&
        composedDate.getMonth() === m &&
        composedDate.getFullYear() === y;
};

const isArray = function (input) {
    return typeof(input) === "object" && (input instanceof Array);
};

const isObject = function (input) {
    return Object.prototype.toString.call(input) === "[object Object]";
};

const isObjectEmpty = function (obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
    }
    return true;
};

const isEmptyString = function (str) {
  return (!str || str.length === 0);
};

const isString = function (input) {
    return (typeof input === 'string' || input instanceof String);
};

const isConvertibleToNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

const isNumber = function (n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number';
};

const arrayContains = function (arr, obj) {
  var i = arr.length;
  while (i--) {
      if (arr[i] === obj) {
          return true;
      }
  }
  return false;
};

const getDomain = function (url) {
    if (url === "") {
      return "";
    }

    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
};

// leading spaces, dot, colon, dollar, single quote, double quote, backslash, trailing spaces
const unsupportedKeyCharRegex = new RegExp("^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$", "g");

// leading spaces, single quote, double quote, backslash, trailing spaces
const unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", "g");

//used to handle cookies in Opera mini
const doubleQuoteRegex = new RegExp("\"", "g");
const singleQuoteRegex = new RegExp("\'", "g");

//keys can't be greater than 1024 chars, values can't be greater than 1024 chars
const removeUnsupportedChars = function (o, callback) {
    if (typeof o === "object") {
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                var sanitizedVal = removeUnsupportedChars(o[key]);
                var sanitizedKey = isString(key) ? sanitize(key, unsupportedKeyCharRegex) : key;

                if (isString(key)) {
                    sanitizedKey = sanitize(key, unsupportedKeyCharRegex);
                    if (sanitizedKey.length > 1024) {
                        sanitizedKey = sanitizedKey.substring(0, 1024);
                        if (callback) {
                          callback(520, sanitizedKey + "... length exceeded 1024 chars. Trimmed.");
                        }
                    }
                } else {
                    sanitizedKey = key;
                }
                delete o[key];
                o[sanitizedKey] = sanitizedVal;
            }
        }
    } else {
        var val;
        if (isString(o)) {
            val = sanitize(o, unsupportedValueCharRegex);
            if (val.length > 1024) {
                val = val.substring(0, 1024);
                if (callback) {
                  callback(521, val + "... length exceeded 1024 chars. Trimmed.");
                }
            }
        } else {
            val = o;
        }
        return val;
    }
    return o;
};

const sanitize = function (input, regex) {
    return input.replace(regex, '');
};

const isLocalStorageSupported = function () {
    try {
        window.localStorage.setItem('wzrk_debug', '12345678');
        window.localStorage.removeItem('wzrk_debug');
        return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
        return false;
    }
};

const getToday = function () {
    var t = new Date();
    return t.getFullYear() + "" + t.getMonth() + "" + t.getDay();
};

const getNow = function () {
    return Math.floor(((new Date()).getTime()) / 1000);
};

const readFromStorage = function (property) {
  if (!property) {
    return null;
  }
  var data = null;
  if (isLocalStorageSupported()) {
      data = localStorage[property] || null;
  }
  if (typeof data !== Constants.UNDEFINED && data !== null) {
      try {
        data = JSON.parse(data);
      } catch (e) {}
  }
  return data;
};

const saveToStorage = function (property, val) {
    if (!property || typeof val === Constants.UNDEFINED || val === null) {
        return;
    }
    try {
        if (isLocalStorageSupported()) {
            localStorage[property] = JSON.stringify(val);
        }
    } catch (e) {
    }
};

const removeFromStorage = function (property) {
  if (!property) {
    return;
  }
  if (isLocalStorageSupported()) {
    delete localStorage[property];
  }
};

const setEnum = function (enumVal) {
  if (isString(enumVal) || isNumber(enumVal)) {
      return "$E_" + enumVal;
  }
  log.error(ErrorManager.MESSAGES.enumFormat);
};

const reportError = function (code, desc) {
  ErrorManager.pushError(code, desc);
};

const isAnonymousDevice = function () {
  const IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
  const identitiesMap = readFromStorage(IDENTITIES_KEY) || {};
  return isObjectEmpty(identitiesMap);
};

export default {
  logLevels,
  setLogLevel,
  getLogLevel,
  log,
  setDate,
  isDateObject,
  convertToWZRKDate,
  isDateValid,
  isArray,
  isObject,
  isObjectEmpty,
  isEmptyString,
  isString,
  isConvertibleToNumber,
  isNumber,
  arrayContains,
  getDomain,
  removeUnsupportedChars,
  sanitize,
  isLocalStorageSupported,
  getToday,
  getNow,
  unsupportedKeyCharRegex,
  unsupportedValueCharRegex,
  doubleQuoteRegex,
  singleQuoteRegex,
  readFromStorage,
  saveToStorage,
  removeFromStorage,
  setEnum,
  reportError,
  isAnonymousDevice,
};
