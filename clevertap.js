(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.clevertap = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _accountId = null;
var _region = null;
var _appVersion = null;

var Account = function () {
  function Account() {
    classCallCheck(this, Account);
  }

  createClass(Account, null, [{
    key: "setAccountId",
    value: function setAccountId(accountId) {
      _accountId = accountId;
    }
  }, {
    key: "getAccountId",
    value: function getAccountId() {
      return _accountId;
    }
  }, {
    key: "setRegion",
    value: function setRegion(region) {
      _region = region;
    }
  }, {
    key: "getRegion",
    value: function getRegion() {
      return _region;
    }
  }, {
    key: "setAppVersion",
    value: function setAppVersion(version) {
      _appVersion = version;
    }
  }, {
    key: "getAppVersion",
    value: function getAppVersion() {
      return _appVersion;
    }
  }]);
  return Account;
}();

var Constants = {
  APP_LAUNCHED: "App Launched",
  CHARGED_ID: 'chargedId',
  ECOOKIE_PREFIX: 'CT_E',
  GCOOKIE_NAME: 'CT_G',
  KCOOKIE_NAME: 'CT_K',
  PCOOKIE_PREFIX: 'CT_P',
  SEQCOOKIE_PREFIX: 'CT_SEQ',
  SCOOKIE_PREFIX: 'CT_S',
  EV_COOKIE: 'CT_EV',
  PR_COOKIE: 'CT_PR',
  ARP_COOKIE: 'CT_ARP',
  UNDEFINED: 'undefined',
  PING_FREQ_IN_MILLIS: 2 * 60 * 1000, // 2 mins
  EVENT_TYPES: {
    EVENT: "event",
    PROFILE: "profile",
    PAGE: "page",
    PING: "ping"
  },
  IDENTITY_TYPES: {
    IDENTITY: "Identity",
    EMAIL: "Email",
    FBID: "FBID",
    GPID: "GPID"
  }
};

var dataNotSent = 'This property has been ignored.';

var ErrorMessages = {
  init: 'Invalid account id',
  event: 'Event structure not valid. Unable to process event',
  gender: 'Gender value should be either M or F. ' + dataNotSent,
  employed: 'Employed value should be either Y or N. ' + dataNotSent,
  married: 'Married value should be either Y or N. ' + dataNotSent,
  education: 'Education value should be either School, College or Graduate. ' + dataNotSent,
  age: 'Age value should be a number. ' + dataNotSent,
  dob: 'DOB value should be a Date Object',
  objArr: 'Expecting Object array in profile',
  dateFormat: 'setDate(number). number should be formatted as yyyymmdd',
  enumFormat: 'setEnum(value). value should be a string or a number',
  phoneFormat: 'Phone number should be formatted as +[country code][number]'
};

var _errors = [];

var ErrorManager = function () {
  function ErrorManager() {
    classCallCheck(this, ErrorManager);
  }

  createClass(ErrorManager, null, [{
    key: 'pushError',
    value: function pushError(code, message) {
      _errors.push({
        c: code,
        d: message
      });
    }
  }, {
    key: 'popError',
    value: function popError() {
      return _errors.shift();
    }
  }]);
  return ErrorManager;
}();

ErrorManager.MESSAGES = ErrorMessages;

var logLevels = {
    DISABLE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3
};

var logLevel = logLevels.INFO;

var setLogLevel = function setLogLevel(level) {
    logLevel = level;
};

var getLogLevel = function getLogLevel() {
    return logLevel;
};

var log = {
    error: function error(m) {
        if (logLevel >= logLevels.ERROR) {
            _log('error', m);
        }
    },

    info: function info(m) {
        if (logLevel >= logLevels.INFO) {
            _log('log', m);
        }
    },

    debug: function debug(m) {
        if (logLevel >= logLevels.DEBUG) {
            _log('debug', m);
        }
    }
};

var _log = function _log(level, m) {
    if (window.console) {
        try {
            var ts = new Date().getTime();
            console[level]('CleverTap [' + ts + ']: ' + m);
        } catch (e) {
            // no-op
        }
    }
};

//expecting  yyyymmdd format either as a number or a string
var setDate = function setDate(dt) {
    if (isDateValid(dt)) {
        return "$D_" + dt;
    }
    log.error(ErrorManager.MESSAGES.dateFormat);
};

var isDateObject = function isDateObject(input) {
    return (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === "object" && input instanceof Date;
};

var convertToWZRKDate = function convertToWZRKDate(dateObj) {
    return "$D_" + Math.round(dateObj.getTime() / 1000);
};

var isDateValid = function isDateValid(date) {
    var matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    if (matches === null) {
        return false;
    }

    var d = matches[3];
    var m = matches[2] - 1;
    var y = matches[1];
    var composedDate = new Date(y, m, d);
    return composedDate.getDate() === d && composedDate.getMonth() === m && composedDate.getFullYear() === y;
};

var isArray = function isArray(input) {
    return (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === "object" && input instanceof Array;
};

var isObject = function isObject(input) {
    return Object.prototype.toString.call(input) === "[object Object]";
};

var isObjectEmpty = function isObjectEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
};

var isEmptyString = function isEmptyString(str) {
    return !str || str.length === 0;
};

var isString = function isString(input) {
    return typeof input === 'string' || input instanceof String;
};

var isConvertibleToNumber = function isConvertibleToNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var isNumber = function isNumber(n) {
    return (/^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number'
    );
};

var arrayContains = function arrayContains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
};

var getDomain = function getDomain(url) {
    if (url === "") {
        return "";
    }

    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
};

// leading spaces, dot, colon, dollar, single quote, double quote, backslash, trailing spaces
var unsupportedKeyCharRegex = new RegExp("^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$", "g");

// leading spaces, single quote, double quote, backslash, trailing spaces
var unsupportedValueCharRegex = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", "g");

//used to handle cookies in Opera mini
var doubleQuoteRegex = new RegExp("\"", "g");
var singleQuoteRegex = new RegExp("\'", "g");

//keys can't be greater than 1024 chars, values can't be greater than 1024 chars
var removeUnsupportedChars = function removeUnsupportedChars(o, callback) {
    if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) === "object") {
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

var sanitize = function sanitize(input, regex) {
    return input.replace(regex, '');
};

var isLocalStorageSupported = function isLocalStorageSupported() {
    try {
        window.localStorage.setItem('wzrk_debug', '12345678');
        window.localStorage.removeItem('wzrk_debug');
        return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
        return false;
    }
};

var getToday = function getToday() {
    var t = new Date();
    return t.getFullYear() + "" + t.getMonth() + "" + t.getDay();
};

var getNow = function getNow() {
    return Math.floor(new Date().getTime() / 1000);
};

var readFromStorage = function readFromStorage(property) {
    if (!property) {
        return null;
    }
    var data = null;
    if (isLocalStorageSupported()) {
        data = localStorage[property] || null;
    }
    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== Constants.UNDEFINED && data !== null) {
        try {
            data = JSON.parse(data);
        } catch (e) {}
    }
    return data;
};

var saveToStorage = function saveToStorage(property, val) {
    if (!property || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === Constants.UNDEFINED || val === null) {
        return;
    }
    try {
        if (isLocalStorageSupported()) {
            localStorage[property] = JSON.stringify(val);
        }
    } catch (e) {}
};

var removeFromStorage = function removeFromStorage(property) {
    if (!property) {
        return;
    }
    if (isLocalStorageSupported()) {
        delete localStorage[property];
    }
};

var setEnum = function setEnum(enumVal) {
    if (isString(enumVal) || isNumber(enumVal)) {
        return "$E_" + enumVal;
    }
    log.error(ErrorManager.MESSAGES.enumFormat);
};

var reportError = function reportError(code, desc) {
    ErrorManager.pushError(code, desc);
};

var isAnonymousDevice = function isAnonymousDevice() {
    var IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
    var identitiesMap = readFromStorage(IDENTITIES_KEY) || {};
    return isObjectEmpty(identitiesMap);
};

var Utils = {
    logLevels: logLevels,
    setLogLevel: setLogLevel,
    getLogLevel: getLogLevel,
    log: log,
    setDate: setDate,
    isDateObject: isDateObject,
    convertToWZRKDate: convertToWZRKDate,
    isDateValid: isDateValid,
    isArray: isArray,
    isObject: isObject,
    isObjectEmpty: isObjectEmpty,
    isEmptyString: isEmptyString,
    isString: isString,
    isConvertibleToNumber: isConvertibleToNumber,
    isNumber: isNumber,
    arrayContains: arrayContains,
    getDomain: getDomain,
    removeUnsupportedChars: removeUnsupportedChars,
    sanitize: sanitize,
    isLocalStorageSupported: isLocalStorageSupported,
    getToday: getToday,
    getNow: getNow,
    unsupportedKeyCharRegex: unsupportedKeyCharRegex,
    unsupportedValueCharRegex: unsupportedValueCharRegex,
    doubleQuoteRegex: doubleQuoteRegex,
    singleQuoteRegex: singleQuoteRegex,
    readFromStorage: readFromStorage,
    saveToStorage: saveToStorage,
    removeFromStorage: removeFromStorage,
    setEnum: setEnum,
    reportError: reportError,
    isAnonymousDevice: isAnonymousDevice
};

/* jshint bitwise: false, laxbreak: true */

var GUID_PREFIX = "fx";
var _guid = null;

//see https://gist.github.com/jed/982883
var uuid = function uuid(a) {
  return a // if the placeholder was passed, return
  ? ( // a random number from 0 to 15
  a ^ // unless b is 8,
  window.crypto.getRandomValues(new Uint8Array(1))[0] // in which case
  % 16 // a random number from
  >> a / 4 // 8 to 11
  ).toString(16) // in hexadecimal
  : ( // or otherwise a concatenated string:
  [1e7] + // 10000000 +
  -1e3 + // -1000 +
  -4e3 + // -4000 +
  -8e3 + // -80000000 +
  -1e11 // -100000000000,
  ).replace( // replacing
  /[018]/g, // zeroes, ones, and eights with
  uuid // random hex digits
  );
};

var Device = function () {
  function Device() {
    classCallCheck(this, Device);
  }

  createClass(Device, null, [{
    key: 'setGUID',
    value: function setGUID(guid) {
      _guid = guid;
      var GUIDKey = StorageManager.getGUIDKey();
      if (guid === null) {
        StorageManager.remove(GUIDKey);
      } else {
        StorageManager.save(GUIDKey, guid);
      }
    }
  }, {
    key: 'getGUID',
    value: function getGUID() {
      if (!_guid) {
        var GUIDKey = StorageManager.getGUIDKey();
        _guid = StorageManager.read(GUIDKey);
      }
      if (!_guid) {
        Device.generateGUID();
      }
      return _guid;
    }
  }, {
    key: 'generateGUID',
    value: function generateGUID() {
      var _uuid = uuid().replace(/[-]/g, "");
      var _g = '' + GUID_PREFIX + _uuid;
      Utils.log.debug('Generating Device ID: ' + _g);
      Device.setGUID(_g);
    }
  }]);
  return Device;
}();

var logLevels$1 = {
    DISABLE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3
};

var logLevel$1 = logLevels$1.INFO;

var setLogLevel$1 = function setLogLevel(level) {
    logLevel$1 = level;
};

var getLogLevel$1 = function getLogLevel() {
    return logLevel$1;
};

var log$1 = {
    error: function error(m) {
        if (logLevel$1 >= logLevels$1.ERROR) {
            _log$1('error', m);
        }
    },

    info: function info(m) {
        if (logLevel$1 >= logLevels$1.INFO) {
            _log$1('log', m);
        }
    },

    debug: function debug(m) {
        if (logLevel$1 >= logLevels$1.DEBUG) {
            _log$1('debug', m);
        }
    }
};

var _log$1 = function _log(level, m) {
    if (window.console) {
        try {
            var ts = new Date().getTime();
            console[level]('CleverTap [' + ts + ']: ' + m);
        } catch (e) {
            // no-op
        }
    }
};

//expecting  yyyymmdd format either as a number or a string
var setDate$1 = function setDate(dt) {
    if (isDateValid$1(dt)) {
        return "$D_" + dt;
    }
    log$1.error(ErrorManager.MESSAGES.dateFormat);
};

var isDateObject$1 = function isDateObject(input) {
    return (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === "object" && input instanceof Date;
};

var convertToWZRKDate$1 = function convertToWZRKDate(dateObj) {
    return "$D_" + Math.round(dateObj.getTime() / 1000);
};

var isDateValid$1 = function isDateValid(date) {
    var matches = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    if (matches === null) {
        return false;
    }

    var d = matches[3];
    var m = matches[2] - 1;
    var y = matches[1];
    var composedDate = new Date(y, m, d);
    return composedDate.getDate() === d && composedDate.getMonth() === m && composedDate.getFullYear() === y;
};

var isArray$1 = function isArray(input) {
    return (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === "object" && input instanceof Array;
};

var isObject$1 = function isObject(input) {
    return Object.prototype.toString.call(input) === "[object Object]";
};

var isObjectEmpty$1 = function isObjectEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
};

var isEmptyString$1 = function isEmptyString(str) {
    return !str || str.length === 0;
};

var isString$1 = function isString(input) {
    return typeof input === 'string' || input instanceof String;
};

var isConvertibleToNumber$1 = function isConvertibleToNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var isNumber$1 = function isNumber(n) {
    return (/^-?[\d.]+(?:e-?\d+)?$/.test(n) && typeof n === 'number'
    );
};

var arrayContains$1 = function arrayContains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
};

var getDomain$1 = function getDomain(url) {
    if (url === "") {
        return "";
    }

    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
};

// leading spaces, dot, colon, dollar, single quote, double quote, backslash, trailing spaces
var unsupportedKeyCharRegex$1 = new RegExp("^\\s+|\\\.|\:|\\\$|\'|\"|\\\\|\\s+$", "g");

// leading spaces, single quote, double quote, backslash, trailing spaces
var unsupportedValueCharRegex$1 = new RegExp("^\\s+|\'|\"|\\\\|\\s+$", "g");

//used to handle cookies in Opera mini
var doubleQuoteRegex$1 = new RegExp("\"", "g");
var singleQuoteRegex$1 = new RegExp("\'", "g");

//keys can't be greater than 1024 chars, values can't be greater than 1024 chars
var removeUnsupportedChars$1 = function removeUnsupportedChars(o, callback) {
    if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) === "object") {
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                var sanitizedVal = removeUnsupportedChars(o[key]);
                var sanitizedKey = isString$1(key) ? sanitize$1(key, unsupportedKeyCharRegex$1) : key;

                if (isString$1(key)) {
                    sanitizedKey = sanitize$1(key, unsupportedKeyCharRegex$1);
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
        if (isString$1(o)) {
            val = sanitize$1(o, unsupportedValueCharRegex$1);
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

var sanitize$1 = function sanitize(input, regex) {
    return input.replace(regex, '');
};

var isLocalStorageSupported$1 = function isLocalStorageSupported() {
    try {
        window.localStorage.setItem('wzrk_debug', '12345678');
        window.localStorage.removeItem('wzrk_debug');
        return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
        return false;
    }
};

var getToday$1 = function getToday() {
    var t = new Date();
    return t.getFullYear() + "" + t.getMonth() + "" + t.getDay();
};

var getNow$1 = function getNow() {
    return Math.floor(new Date().getTime() / 1000);
};

var readFromStorage$1 = function readFromStorage(property) {
    if (!property) {
        return null;
    }
    var data = null;
    if (isLocalStorageSupported$1()) {
        data = localStorage[property] || null;
    }
    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== Constants.UNDEFINED && data !== null) {
        try {
            data = JSON.parse(data);
        } catch (e) {}
    }
    return data;
};

var saveToStorage$1 = function saveToStorage(property, val) {
    if (!property || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === Constants.UNDEFINED || val === null) {
        return;
    }
    try {
        if (isLocalStorageSupported$1()) {
            localStorage[property] = JSON.stringify(val);
        }
    } catch (e) {}
};

var removeFromStorage$1 = function removeFromStorage(property) {
    if (!property) {
        return;
    }
    if (isLocalStorageSupported$1()) {
        delete localStorage[property];
    }
};

var setEnum$1 = function setEnum(enumVal) {
    if (isString$1(enumVal) || isNumber$1(enumVal)) {
        return "$E_" + enumVal;
    }
    log$1.error(ErrorManager.MESSAGES.enumFormat);
};

var reportError$1 = function reportError(code, desc) {
    ErrorManager.pushError(code, desc);
};

var isAnonymousDevice$1 = function isAnonymousDevice() {
    var IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
    var identitiesMap = readFromStorage$1(IDENTITIES_KEY) || {};
    return isObjectEmpty$1(identitiesMap);
};

var Utils$1 = {
    logLevels: logLevels$1,
    setLogLevel: setLogLevel$1,
    getLogLevel: getLogLevel$1,
    log: log$1,
    setDate: setDate$1,
    isDateObject: isDateObject$1,
    convertToWZRKDate: convertToWZRKDate$1,
    isDateValid: isDateValid$1,
    isArray: isArray$1,
    isObject: isObject$1,
    isObjectEmpty: isObjectEmpty$1,
    isEmptyString: isEmptyString$1,
    isString: isString$1,
    isConvertibleToNumber: isConvertibleToNumber$1,
    isNumber: isNumber$1,
    arrayContains: arrayContains$1,
    getDomain: getDomain$1,
    removeUnsupportedChars: removeUnsupportedChars$1,
    sanitize: sanitize$1,
    isLocalStorageSupported: isLocalStorageSupported$1,
    getToday: getToday$1,
    getNow: getNow$1,
    unsupportedKeyCharRegex: unsupportedKeyCharRegex$1,
    unsupportedValueCharRegex: unsupportedValueCharRegex$1,
    doubleQuoteRegex: doubleQuoteRegex$1,
    singleQuoteRegex: singleQuoteRegex$1,
    readFromStorage: readFromStorage$1,
    saveToStorage: saveToStorage$1,
    removeFromStorage: removeFromStorage$1,
    setEnum: setEnum$1,
    reportError: reportError$1,
    isAnonymousDevice: isAnonymousDevice$1
};

var StorageManager = function () {
  function StorageManager() {
    classCallCheck(this, StorageManager);
  }

  createClass(StorageManager, null, [{
    key: 'save',
    value: function save(key, value) {
      if (!key || !value) {
        return;
      }
      Utils$1.saveToStorage(key, value);
    }
  }, {
    key: 'read',
    value: function read(key) {
      if (!key) {
        return null;
      }
      return Utils$1.readFromStorage(key);
    }
  }, {
    key: 'remove',
    value: function remove(key) {
      if (!key) {
        return;
      }
      Utils$1.removeFromStorage(key);
    }
  }, {
    key: 'getGUIDKey',
    value: function getGUIDKey() {
      var accountId = Account.getAccountId();
      if (!accountId) {
        return null;
      }
      return Constants.GCOOKIE_NAME + '_' + accountId;
    }
  }, {
    key: 'getSessionKey',
    value: function getSessionKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.SCOOKIE_PREFIX + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getUserEventsKey',
    value: function getUserEventsKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.EV_COOKIE + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getUserProfileKey',
    value: function getUserProfileKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.PR_COOKIE + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getSavedEventsKey',
    value: function getSavedEventsKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.ECOOKIE_PREFIX + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getSavedProfilesKey',
    value: function getSavedProfilesKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.PCOOKIE_PREFIX + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getSavedSequenceNumberKey',
    value: function getSavedSequenceNumberKey() {
      var accountId = Account.getAccountId();
      if (!accountId) {
        return null;
      }
      return Constants.SEQCOOKIE_PREFIX + '_' + accountId;
    }
  }, {
    key: 'getARPKey',
    value: function getARPKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.ARP_COOKIE + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getMetaKey',
    value: function getMetaKey() {
      var accountId = Account.getAccountId();
      var guid = Device.getGUID();
      if (!accountId || !guid) {
        return null;
      }
      return Constants.META_COOKIE + '_' + accountId + '_' + guid;
    }
  }, {
    key: 'getIdentitiesMapKey',
    value: function getIdentitiesMapKey() {
      var accountId = Account.getAccountId();
      if (!accountId) {
        return null;
      }
      return Constants.KCOOKIE_NAME + '_' + accountId;
    }
  }, {
    key: 'getChargedIdKey',
    value: function getChargedIdKey() {
      var accountId = Account.getAccountId();
      if (!accountId) {
        return null;
      }
      return Constants.CHARGED_ID + '_' + accountId;
    }
  }]);
  return StorageManager;
}();

var _sessionId = 0;
var _previousSessionId = 0;
var _sessionCount = 0;
var _pageCount = 0;
var _isFirstSession;

var _getStorageKey = function _getStorageKey() {
  return StorageManager.getSessionKey();
};

var _readSessionObject = function _readSessionObject() {
  var storageKey = _getStorageKey();
  var obj = StorageManager.read(storageKey) || {};
  if (!Utils.isObject(obj)) {
    obj = {};
  }
  return obj;
};

var _saveSessionObject = function _saveSessionObject(obj) {
  var storageKey = _getStorageKey();
  StorageManager.save(storageKey, obj);
};

var Session = function () {
  function Session() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Session);

    this.options = options;
    _sessionId = Utils.getNow();
    var sessionObj = _readSessionObject();
    _previousSessionId = sessionObj.ps || 0;
    _isFirstSession = _previousSessionId <= 0;
    _pageCount = sessionObj.p || 1; // not updating page counts for now
    _sessionCount = (sessionObj.sc || 0) + 1;
    sessionObj.ps = _sessionId;
    sessionObj.p = _pageCount;
    sessionObj.sc = _sessionCount;
    _saveSessionObject(sessionObj);
  }

  createClass(Session, [{
    key: 'isFirstSession',
    value: function isFirstSession() {
      return _isFirstSession;
    }
  }, {
    key: 'getPageCount',
    value: function getPageCount() {
      return _pageCount;
    }
  }, {
    key: 'getTimeElapsed',
    value: function getTimeElapsed() {
      var sessionStart = Session.getSessionId();
      if (sessionStart <= 0) {
        return 0;
      }
      return Math.floor(Utils.getNow() - sessionStart);
    }
  }, {
    key: 'getTotalVisits',
    value: function getTotalVisits() {
      return _sessionCount;
    }
  }, {
    key: 'getLastVisit',
    value: function getLastVisit() {
      return _previousSessionId > 0 ? new Date(_previousSessionId * 1000) : 0;
    }
  }], [{
    key: 'getSessionId',
    value: function getSessionId() {
      return _sessionId;
    }
  }]);
  return Session;
}();

/*jshint bitwise: false*/
var LZS = {
    _f: String.fromCharCode,
    getKeyStr: function getKeyStr() {
        var key = "";
        var i = 0;

        for (i = 0; i <= 25; i++) {
            key = key + String.fromCharCode(i + 65);
        }

        for (i = 0; i <= 25; i++) {
            key = key + String.fromCharCode(i + 97);
        }

        for (i = 0; i < 10; i++) {
            key = key + i;
        }

        return key + "+/=";
    },
    convertToFormattedHex: function convertToFormattedHex(byte_arr) {
        var hex_str = "",
            i,
            len,
            tmp_hex;

        if (!Utils.isArray(byte_arr)) {
            return false;
        }

        len = byte_arr.length;

        for (i = 0; i < len; ++i) {
            if (byte_arr[i] < 0) {
                byte_arr[i] = byte_arr[i] + 256;
            }
            if (byte_arr[i] === undefined) {
                byte_arr[i] = 0;
            }
            tmp_hex = byte_arr[i].toString(16);

            // Add leading zero.
            if (tmp_hex.length === 1) {
                tmp_hex = "0" + tmp_hex;
            }

            //        beautification - needed if you're printing this in the console, else keep commented
            //        if ((i + 1) % 16 === 0) {
            //          tmp_hex += "\n";
            //        } else {
            //          tmp_hex += " ";
            //        }

            hex_str += tmp_hex;
        }

        return hex_str.trim();
    },
    convertStringToHex: function convertStringToHex(s) {
        var byte_arr = [];
        for (var i = 0; i < s.length; i++) {
            var value = s.charCodeAt(i);
            byte_arr.push(value & 255);
            byte_arr.push(value >> 8 & 255);
        }
        return LZS.convertToFormattedHex(byte_arr);
    },
    compressToBase64: function compressToBase64(input) {
        if (input === null) {
            return "";
        }
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = LZS.compress(input);

        while (i < input.length * 2) {

            if (i % 2 === 0) {
                chr1 = input.charCodeAt(i / 2) >> 8;
                chr2 = input.charCodeAt(i / 2) & 255;
                if (i / 2 + 1 < input.length) {
                    chr3 = input.charCodeAt(i / 2 + 1) >> 8;
                } else {
                    chr3 = NaN;
                }
            } else {
                chr1 = input.charCodeAt((i - 1) / 2) & 255;
                if ((i + 1) / 2 < input.length) {
                    chr2 = input.charCodeAt((i + 1) / 2) >> 8;
                    chr3 = input.charCodeAt((i + 1) / 2) & 255;
                } else {
                    chr2 = chr3 = NaN;
                }
            }
            i += 3;

            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + LZS._keyStr.charAt(enc1) + LZS._keyStr.charAt(enc2) + LZS._keyStr.charAt(enc3) + LZS._keyStr.charAt(enc4);
        }

        return output;
    },
    compress: function compress(uncompressed) {
        if (uncompressed === null) {
            return "";
        }
        var i,
            value,
            context_dictionary = {},
            context_dictionaryToCreate = {},
            context_c = "",
            context_wc = "",
            context_w = "",
            context_enlargeIn = 2,
            // Compensate for the first entry which should not count
        context_dictSize = 3,
            context_numBits = 2,
            context_data_string = "",
            context_data_val = 0,
            context_data_position = 0,
            ii,
            f = LZS._f;

        for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }

            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            } else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = context_data_val << 1;
                            if (context_data_position === 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position === 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = context_data_val << 1 | value;
                            if (context_data_position === 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position === 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn === 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position === 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn === 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                // Add wc to the dictionary.
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }

        // Output the code for w.
        if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1;
                        if (context_data_position === 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position === 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                } else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | value;
                        if (context_data_position === 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position === 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn === 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position === 15) {
                        context_data_position = 0;
                        context_data_string += f(context_data_val);
                        context_data_val = 0;
                    } else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn === 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }

        // Mark the end of the stream
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;
            if (context_data_position === 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
            } else {
                context_data_position++;
            }
            value = value >> 1;
        }

        // Flush the last char
        while (true) {
            context_data_val = context_data_val << 1;
            if (context_data_position === 15) {
                context_data_string += f(context_data_val);
                break;
            } else {
                context_data_position++;
            }
        }
        return context_data_string;
    }
};

LZS._keyStr = LZS.getKeyStr();

var LZS$1 = {
    compressToBase64: LZS.compressToBase64
};

var Helpers = {
    compressData: function compressData(dataObject) {
        Utils.log.debug('dobj:' + dataObject);
        return LZS$1.compressToBase64(dataObject);
    },
    // profile like https://developers.google.com/+/api/latest/people
    processGPlusUserObj: function processGPlusUserObj(user) {
        var profileData = {};
        if (_typeof(user.displayName) !== Constants.UNDEFINED) {
            profileData.Name = user.displayName;
        }
        if (_typeof(user.id) !== Constants.UNDEFINED) {
            profileData.GPID = user.id + "";
        }

        if (_typeof(user.gender) !== Constants.UNDEFINED) {
            if (user.gender === "male") {
                profileData.Gender = "M";
            } else if (user.gender === "female") {
                profileData.Gender = "F";
            } else if (user.gender === "other") {
                profileData.Gender = "O";
            }
        }

        if (_typeof(user.image) !== Constants.UNDEFINED) {
            if (!user.image.isDefault) {
                profileData.Photo = user.image.url.split('?sz')[0];
            }
        }

        if (_typeof(user.emails) !== Constants.UNDEFINED) {
            for (var emailIdx = 0; emailIdx < user.emails.length; emailIdx++) {
                var emailObj = user.emails[emailIdx];
                if (emailObj.type === 'account') {
                    profileData.Email = emailObj.value;
                }
            }
        }

        if (user.organizations) {
            profileData.Employed = 'N';
            for (var i = 0; i < user.organizations.length; i++) {
                var orgObj = user.organizations[i];
                if (orgObj.type === 'work') {
                    profileData.Employed = 'Y';
                    break;
                }
            }
        }

        if (user.birthday) {
            var yyyymmdd = user.birthday.split('-'); //comes in as "1976-07-27"
            profileData.DOB = Utils.setDate(yyyymmdd[0] + yyyymmdd[1] + yyyymmdd[2]);
        }

        if (user.relationshipStatus) {
            profileData.Married = 'N';
            if (user.relationshipStatus === 'married') {
                profileData.Married = 'Y';
            }
        }
        Utils.log.debug("gplus usr profile " + JSON.stringify(profileData));

        return profileData;
    },
    processFBUserObj: function processFBUserObj(user) {
        var profileData = {};
        profileData.Name = user.name;
        if (user.id) {
            profileData.FBID = user.id + "";
        }
        // Feb 2014 - FB announced over 58 gender options, hence we specifically look for male or female. Rest we don't care.
        if (user.gender === "male") {
            profileData.Gender = "M";
        } else if (user.gender === "female") {
            profileData.Gender = "F";
        } else {
            profileData.Gender = "O";
        }

        var getHighestEducation = function getHighestEducation(eduArr) {
            if (eduArr) {
                var college = "";
                var highschool = "";

                for (var i = 0; i < eduArr.length; i++) {
                    var edu = eduArr[i];
                    if (edu.type) {
                        var type = edu.type;
                        if (type === "Graduate School") {
                            return "Graduate";
                        } else if (type === "College") {
                            college = "1";
                        } else if (type === "High School") {
                            highschool = "1";
                        }
                    }
                }

                if (college === "1") {
                    return "College";
                } else if (highschool === "1") {
                    return "School";
                }
            }
        };

        if (user.relationship_status) {
            profileData.Married = 'N';
            if (user.relationship_status === 'Married') {
                profileData.Married = 'Y';
            }
        }

        var edu = getHighestEducation(user.education);
        if (edu) {
            profileData.Education = edu;
        }

        profileData.Employed = user.work ? 'Y' : 'N';

        if (user.email) {
            profileData.Email = user.email;
        }

        if (user.birthday) {
            var mmddyy = user.birthday.split('/'); //comes in as "08/15/1947"
            profileData.DOB = Utils.setDate(mmddyy[2] + mmddyy[0] + mmddyy[1]);
        }
        return profileData;
    }
};

var _globalChargedId = void 0;

//events can't have any nested structure or arrays
var isEventStructureFlat = function isEventStructureFlat(eventObj) {
    if (Utils.isObject(eventObj)) {
        for (var key in eventObj) {
            if (eventObj.hasOwnProperty(key)) {
                if (Utils.isObject(eventObj[key]) || Utils.isArray(eventObj[key])) {
                    return false;
                } else if (Utils.isDateObject(eventObj[key])) {
                    eventObj[key] = Utils.convertToWZRKDate(eventObj[key]);
                }
            }
        }
        return true;
    }
    return false;
};

var isProfileValid = function isProfileValid(profileObj) {
    var valid = true;
    if (Utils.isObject(profileObj)) {
        for (var profileKey in profileObj) {
            if (profileObj.hasOwnProperty(profileKey)) {
                var profileVal = profileObj[profileKey];

                if ((typeof profileVal === 'undefined' ? 'undefined' : _typeof(profileVal)) === Constants.UNDEFINED) {
                    delete profileObj[profileKey];
                    continue;
                }
                if (profileKey === 'Gender' && !profileVal.match(/^M$|^F$/)) {
                    valid = false;
                    Utils.log.error(ErrorManager.MESSAGES.gender);
                }

                if (profileKey === 'Employed' && !profileVal.match(/^Y$|^N$/)) {
                    valid = false;
                    Utils.log.error(ErrorManager.MESSAGES.employed);
                }

                if (profileKey === 'Married' && !profileVal.match(/^Y$|^N$/)) {
                    valid = false;
                    Utils.log.error(ErrorManager.MESSAGES.married);
                }

                if (profileKey === 'Education' && !profileVal.match(/^School$|^College$|^Graduate$/)) {
                    valid = false;
                    Utils.log.error(ErrorManager.MESSAGES.education);
                }

                if (profileKey === 'Age' && (typeof profileVal === 'undefined' ? 'undefined' : _typeof(profileVal)) !== Constants.UNDEFINED) {
                    if (Utils.isConvertibleToNumber(profileVal)) {
                        profileObj.Age = +profileVal;
                    } else {
                        valid = false;
                        Utils.log.error(ErrorManager.MESSAGES.age);
                    }
                }

                // dob will come in like this - $dt_19470815 or dateObject
                if (profileKey === 'DOB') {
                    if ((!/^\$D_/.test(profileVal) || (profileVal + "").length !== 11) && !Utils.isDateObject(profileVal)) {
                        valid = false;
                        Utils.log.error(ErrorManager.MESSAGES.dob);
                    }

                    if (Utils.isDateObject(profileVal)) {
                        profileObj[profileKey] = Utils.convertToWZRKDate(profileVal);
                    }
                } else if (Utils.isDateObject(profileVal)) {
                    profileObj[profileKey] = Utils.convertToWZRKDate(profileVal);
                }

                if (profileKey === 'Phone' && !Utils.isObjectEmpty(profileVal)) {
                    if (profileVal.length > 8 && profileVal.charAt(0) === '+') {
                        // valid phone number
                        profileVal = profileVal.substring(1, profileVal.length);
                        if (Utils.isConvertibleToNumber(profileVal)) {
                            profileObj.Phone = +profileVal;
                        } else {
                            valid = false;
                            Utils.log.error(ErrorManager.MESSAGES.phoneFormat + ". Removed.");
                        }
                    } else {
                        valid = false;
                        Utils.log.error(ErrorManager.MESSAGES.phoneFormat + ". Removed.");
                    }
                }

                if (!valid) {
                    delete profileObj[profileKey];
                }
            }
        }
    }

    return valid;
};

var isChargedEventStructureValid = function isChargedEventStructureValid(chargedObj, callback) {
    if (Utils.isObject(chargedObj)) {
        for (var key in chargedObj) {
            if (chargedObj.hasOwnProperty(key)) {

                if (key === "Items") {
                    if (!Utils.isArray(chargedObj[key])) {
                        return false;
                    }

                    if (chargedObj[key].length > 16) {
                        if (callback) {
                            callback(522, "Charged Items exceed 16 limit. Actual count: " + chargedObj[key].length + ". Additional items will be dropped.");
                        }
                    }

                    for (var itemKey in chargedObj[key]) {
                        if (chargedObj[key].hasOwnProperty(itemKey)) {
                            // since default array implementation could be overridden - e.g. Teabox site
                            if (!Utils.isObject(chargedObj[key][itemKey]) || !isEventStructureFlat(chargedObj[key][itemKey])) {
                                return false;
                            }
                        }
                    }
                } else {
                    //Items
                    if (Utils.isObject(chargedObj[key]) || Utils.isArray(chargedObj[key])) {
                        return false;
                    } else if (Utils.isDateObject(chargedObj[key])) {
                        chargedObj[key] = Utils.convertToWZRKDate(chargedObj[key]);
                    }
                } // if key == Items
            }
        } //for..
        //save charged Id
        if (_typeof(chargedObj[Constants.CHARGED_ID]) !== Constants.UNDEFINED) {
            var chargedId = chargedObj[Constants.CHARGED_ID];
            var CHARGEDIDKey = StorageManager.getChargedIdKey();
            if ((typeof _globalChargedId === 'undefined' ? 'undefined' : _typeof(_globalChargedId)) === Constants.UNDEFINED) {
                _globalChargedId = StorageManager.read(CHARGEDIDKey);
            }
            if ((typeof _globalChargedId === 'undefined' ? 'undefined' : _typeof(_globalChargedId)) !== Constants.UNDEFINED && _globalChargedId === chargedId) {
                //drop event- duplicate charged id
                Utils.log.error("Duplicate charged Id - Dropped" + chargedObj);
                return false;
            }
            _globalChargedId = chargedId;
            StorageManager.save(CHARGEDIDKey, chargedId);
        }
        return true;
    } // if object (chargedObject)
    return false;
};

var Validator = {
    isEventStructureFlat: isEventStructureFlat,
    isProfileValid: isProfileValid,
    isChargedEventStructureValid: isChargedEventStructureValid
};

var _profileQueue = [];

var _addToIdentitiesMap = function _addToIdentitiesMap(identifiers) {
  var IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
  var GUID = Device.getGUID();

  if (!GUID || !identifiers || identifiers.length <= 0) {
    return;
  }
  var identitiesMap = StorageManager.read(IDENTITIES_KEY) || {};

  for (var index = 0; index < identifiers.length; index++) {
    var identifier = identifiers[index];
    if (!identifier.type || !identifier.id) {
      continue;
    }
    var key = identifier.type + '_' + identifier.id;
    identitiesMap[key] = GUID;
  }
  StorageManager.save(IDENTITIES_KEY, identitiesMap);
};

var ProfileHandler = function () {
  function ProfileHandler(api, cachedQueue) {
    classCallCheck(this, ProfileHandler);

    this.api = api;

    _profileQueue.push = function (argsArray) {
      var profileObj = ProfileHandler.generateProfileObj(argsArray);
      var data = ProfileHandler.generateProfileEvent(profileObj);
      this.api.processEvent(data);
    }.bind(this);

    if (cachedQueue && cachedQueue.length > 0) {
      for (var index = 0; index < cachedQueue.length; index++) {
        this.push(cachedQueue[index]);
      }
    }
  }

  createClass(ProfileHandler, [{
    key: 'push',
    value: function push() {
      //since arguments is not an array, convert it into an array
      _profileQueue.push(Array.prototype.slice.call(arguments));
      return true;
    }
  }, {
    key: 'getAttribute',
    value: function getAttribute(propName) {
      return this.api.getProfileAttribute(propName);
    }
  }], [{
    key: 'getCachedGUIDForIdentity',
    value: function getCachedGUIDForIdentity(type, identifier) {
      if (!type || !identifier) {
        return null;
      }
      var IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
      if (!IDENTITIES_KEY) {
        return null;
      }
      var identitiesMap = StorageManager.read(IDENTITIES_KEY) || {};
      var key = type + '_' + identifier;
      return identitiesMap[key] || null;
    }
  }, {
    key: 'extractIdentifiersFromProfileObj',
    value: function extractIdentifiersFromProfileObj(profileObj) {
      if (!profileObj || Utils.isObjectEmpty(profileObj)) {
        return null;
      }

      var identifiers = [];

      if (profileObj.Email) {
        identifiers.push({
          type: Constants.IDENTITY_TYPES.EMAIL,
          id: profileObj.Email
        });
      }
      if (profileObj.GPID) {
        identifiers.push({
          type: Constants.IDENTITY_TYPES.GPID,
          id: profileObj.GPID
        });
      }
      if (profileObj.FBID) {
        identifiers.push({
          type: Constants.IDENTITY_TYPES.FBID,
          id: profileObj.FBID
        });
      }
      if (profileObj.Identity) {
        identifiers.push({
          type: Constants.IDENTITY_TYPES.IDENTITY,
          id: profileObj.Identity
        });
      }
      return identifiers;
    }
  }, {
    key: 'generateProfileObj',
    value: function generateProfileObj(profileArr) {
      var profileObj;

      if (!Utils.isArray(profileArr) || profileArr.length <= 0) {
        return null;
      }

      for (var index = 0; index < profileArr.length; index++) {
        var outerObj = profileArr[index];
        profileObj = null;
        if (outerObj.Site) {
          //organic data from the site
          profileObj = outerObj.Site;
          if (Utils.isObjectEmpty(profileObj) || !Validator.isProfileValid(profileObj)) {
            return null;
          }
        } else if (outerObj.Facebook) {
          //fb connect data
          var FbProfileObj = outerObj.Facebook;
          //make sure that the object contains any data at all
          if (!Utils.isObjectEmpty(FbProfileObj) && !FbProfileObj.error) {
            profileObj = Helpers.processFBUserObj(FbProfileObj);
          }
        } else if (outerObj['Google Plus']) {
          var GPlusProfileObj = outerObj['Google Plus'];
          if (!Utils.isObjectEmpty(GPlusProfileObj) && !GPlusProfileObj.error) {
            profileObj = Helpers.processGPlusUserObj(GPlusProfileObj);
          }
        }

        if (profileObj && !Utils.isObjectEmpty(profileObj)) {
          // profile got set from above
          if (!profileObj.tz) {
            //try to auto capture user timezone if not present
            profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
          }
          break;
        }
      }
      return profileObj;
    }
  }, {
    key: 'generateProfileEvent',
    value: function generateProfileEvent(profileObj) {
      if (!profileObj || Utils.isObjectEmpty(profileObj)) {
        return null;
      }
      var identifiers = ProfileHandler.extractIdentifiersFromProfileObj(profileObj);
      if (identifiers.length > 0) {
        _addToIdentitiesMap(identifiers);
      }

      return {
        ep: Utils.getNow(),
        type: Constants.EVENT_TYPES.PROFILE,
        profile: profileObj
      };
    }
  }]);
  return ProfileHandler;
}();

var Request = function () {
  function Request(url, data) {
    classCallCheck(this, Request);

    this.url = url;
    this.data = data || [];
  }

  createClass(Request, [{
    key: 'send',
    value: function send(callback) {
      function _onRequestError() {
        if (callback) {
          callback(request.status, request.error);
        }
      }

      function _onRequestLoad() {
        if (callback) {
          callback(request.status, request.response);
        }
      }

      var request = new XMLHttpRequest({ mozSystem: true });
      request.open('post', this.url, true);
      request.responseType = 'json';
      request.addEventListener('error', _onRequestError);
      request.addEventListener('load', _onRequestLoad);
      request.setRequestHeader("Accept", "application/json");
      request.setRequestHeader("Content-Type", "application/json");
      request.send(JSON.stringify(this.data));

      Utils.log.debug("req snt -> url: " + this.url);
    }
  }]);
  return Request;
}();

var version = 10000;

var _loadSavedUnsentEvents = function _loadSavedUnsentEvents(unsentKey) {
  var savedUnsentEvents = StorageManager.read(unsentKey);
  if (!Utils.isArray(savedUnsentEvents)) {
    return [];
  }
  return savedUnsentEvents;
};

var _loadSavedSequenceNumber = function _loadSavedSequenceNumber(key) {
  var num = StorageManager.read(key) || 0;
  return parseInt(num, 10);
};

var _getSavedEventsKey = function _getSavedEventsKey() {
  return StorageManager.getSavedEventsKey();
};

var _getSavedProfilesKey = function _getSavedProfilesKey() {
  return StorageManager.getSavedProfilesKey();
};

var _getSavedSequenceNumberKey = function _getSavedSequenceNumberKey() {
  return StorageManager.getSavedSequenceNumberKey();
};

var _getARPKey = function _getARPKey() {
  return StorageManager.getARPKey();
};

var QueueManager = function () {
  function QueueManager(options) {
    classCallCheck(this, QueueManager);

    this.options = options;
    this.options.eventUploadRetryInterval = this.options.eventUploadInterval;
    this._uploading = false;
    this._requestScheduled = false;
    this._unsentEvents = _loadSavedUnsentEvents(_getSavedEventsKey());
    this._unsentProfiles = _loadSavedUnsentEvents(_getSavedProfilesKey());
    this._sequenceNumber = _loadSavedSequenceNumber(_getSavedSequenceNumberKey());
    this._scheduleEvents();
  }

  createClass(QueueManager, [{
    key: 'clearEvents',
    value: function clearEvents(callback) {
      var _this2 = this;

      this._sendEvents(function () {
        _this2._unsentEvents = [];
        _this2._unsentProfiles = [];
        _this2._saveEvents();
        callback();
      });
    }
  }, {
    key: 'queueEvent',
    value: function queueEvent(data) {
      if (!data) {
        return;
      }
      data._seq = this._nextSequenceNumber();
      var _;
      Utils.log.debug('Queuing event ' + JSON.stringify(data));
      if (data.type === Constants.EVENT_TYPES.PROFILE) {
        _ = this._unsentProfiles.push(data);
      } else {
        _ = this._unsentEvents.push(data);
      }
      this._saveEvents();
      this._scheduleEvents();
    }
  }, {
    key: '_getEndPoint',
    value: function _getEndPoint() {
      if (Account.getRegion()) {
        this.options.domain = Account.getRegion() + '.' + this.options.domain;
      }
      return this.options.protocol + '//' + this.options.domain + '/a2?t=77';
    }
  }, {
    key: '_unsentCount',
    value: function _unsentCount() {
      return this._unsentEvents.length + this._unsentProfiles.length;
    }
  }, {
    key: '_scheduleRetry',
    value: function _scheduleRetry() {
      this.options.eventUploadRetryInterval = this.options.eventUploadRetryInterval * 2;
      this._scheduleEvents(null, true);
    }
  }, {
    key: '_scheduleEvents',
    value: function _scheduleEvents(callback, retry) {
      if (this._unsentCount() === 0) {
        Utils.log.debug("No events in the queue, not scheduling an event update");
        return false;
      }

      // if we have more than the min events queued send now
      if (this._unsentCount() >= this.options.eventUploadThreshold) {
        this._sendEvents(callback);
        return true;
      }

      // otherwise schdule and event upload
      if (this._requestScheduled) {
        Utils.log.debug("Event upload already scheduled");
        return false;
      }

      this._requestScheduled = true;

      var interval = retry ? this.options.eventUploadRetryInterval : this.options.eventUploadInterval;

      setTimeout(function () {
        this._requestScheduled = false;
        this._sendEvents(callback);
      }.bind(this), interval);

      Utils.log.debug('Scheduling an event upload in ' + interval / 1000 + ' seconds');

      return false;
    }
  }, {
    key: '_sendEvents',
    value: function _sendEvents(callback) {
      var _willNotSend = false;
      var _message = "";
      if (this._uploading) {
        _willNotSend = true;
        _message = "Already Uploading";
      }
      if (this._unsentCount() <= 0) {
        _willNotSend = true;
        _message = "No events in the queue";
      }
      if (_willNotSend) {
        var _debugMessage = 'Skipping events upload: ' + _message;
        Utils.log.debug(_debugMessage);

        if (typeof callback === 'function') {
          callback(0, _debugMessage);
        }
        return;
      }

      this._uploading = true;

      var url = this._getEndPoint();
      url = this._addToURL(url, 'sn', Utils.getNow()); // send epoch seconds as seq number
      url = this._addARPToRequest(url);
      url = this._addToURL(url, "r", new Date().getTime()); // add epoch millis to beat caching of the URL

      var meta = {
        id: Account.getAccountId(),
        "SDK Version": version,
        s: '' + Session.getSessionId()
      };

      if (Account.getAppVersion()) {
        meta.Version = '' + Account.getAppVersion();
      }

      var guid = Device.getGUID();

      if (guid) {
        url = this._addToURL(url, "gc", guid);
        meta.g = guid;
      }

      url = this._addToURL(url, "d", Helpers.compressData(JSON.stringify(meta)));

      // fetch events to send
      var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);
      var mergedEvents = this._mergeEventQueues(numEvents);
      var maxEventId = mergedEvents.maxEventId;
      var maxProfilesId = mergedEvents.maxProfilesId;
      var events = mergedEvents.eventsToSend;

      Utils.log.debug('Sending events: ' + JSON.stringify(events));

      var _this = this;
      new Request(url, events).send(function (status, response) {
        _this._uploading = false;
        response = response || {};
        Utils.log.debug('handling response with status: ' + status + ' and data: ' + JSON.stringify(response));

        try {
          if (status === 200) {
            if (response.g) {
              Device.setGUID(response.g);
            }
            _this._removeEvents(maxEventId, maxProfilesId);
            _this._saveEvents();
            _this._updateARP(response);

            // Schedule next upload in case there are more in the queue
            if (!_this._scheduleEvents(callback) && typeof callback === 'function') {
              callback(status, response);
            }

            // handle errors
            // request too large
          } else if (status === 413) {
            Utils.log.error('event upload request too large');
            // reduct batch size and try again
            // if just one event remove it and give up
            if (_this.options.uploadBatchSize === 1) {
              _this._removeEvents(maxEventId, maxProfilesId);
            }

            _this.options.uploadBatchSize = Math.ceil(numEvents / 2);
            _this._sendEvents(callback);

            // all other errors
          } else {
            Utils.log.error('Events upload failed with status ' + status + '.  Will retry.');
            _this._scheduleRetry();
            if (typeof callback === 'function') {
              callback(status, response);
            }
          }
        } catch (e) {
          _this._uploading = false;
          Utils.log.error('Events upload failed: ' + e.message + '.  Will retry.');
          _this._scheduleRetry();
        }
      });
    }
  }, {
    key: '_saveEvents',
    value: function _saveEvents() {
      StorageManager.save(_getSavedEventsKey(), this._unsentEvents);
      StorageManager.save(_getSavedProfilesKey(), this._unsentProfiles);
    }
  }, {
    key: '_trimEventsQueued',
    value: function _trimEventsQueued(queue) {
      if (queue.length > this.options.maxSavedEventCount) {
        queue.splice(0, queue.length - this.options.maxSavedEventCount);
      }
    }
  }, {
    key: '_removeEvents',
    value: function _removeEvents(maxEventId, maxProfilesId) {
      this._removeEventsFromQueue('_unsentEvents', maxEventId);
      this._removeEventsFromQueue('_unsentProfiles', maxProfilesId);
    }
  }, {
    key: '_removeEventsFromQueue',
    value: function _removeEventsFromQueue(eventQueue, maxId) {
      if (maxId < 0) {
        return;
      }
      var filteredEvents = [];
      for (var i = 0; i < this[eventQueue].length || 0; i++) {
        if (this[eventQueue][i]._seq > maxId) {
          filteredEvents.push(this[eventQueue][i]);
        }
      }
      this[eventQueue] = filteredEvents;
    }
  }, {
    key: '_nextSequenceNumber',
    value: function _nextSequenceNumber() {
      this._sequenceNumber++;
      StorageManager.save(_getSavedSequenceNumberKey(), this._sequenceNumber);
      return this._sequenceNumber;
    }
  }, {
    key: '_mergeEventQueues',
    value: function _mergeEventQueues(numEvents) {
      var eventsToSend = [];
      var eventIndex = 0;
      var maxEventId = -1;
      var profilesIndex = 0;
      var maxProfilesId = -1;

      while (eventsToSend.length < numEvents) {
        var event;
        var noProfiles = profilesIndex >= this._unsentProfiles.length;
        var noEvents = eventIndex >= this._unsentEvents.length;

        if (noEvents && noProfiles) {
          Utils.log.error('Problem merging event queues, fewer events than expected');
          break;
        } else if (noProfiles) {
          event = this._unsentEvents[eventIndex++];
          maxEventId = event._seq;
        } else if (noEvents) {
          event = this._unsentProfiles[profilesIndex++];
          maxProfilesId = event._seq;
        } else {
          if (this._unsentEvents[eventIndex]._seq < this._unsentProfiles[profilesIndex]._seq) {
            event = this._unsentEvents[eventIndex++];
            maxEventId = event._seq;
          } else {
            event = this._unsentProfiles[profilesIndex++];
            maxProfilesId = event._seq;
          }
        }
        eventsToSend.push(event);
      }

      return {
        eventsToSend: eventsToSend,
        maxEventId: maxEventId,
        maxProfilesId: maxProfilesId
      };
    }
  }, {
    key: '_updateARP',
    value: function _updateARP() {
      var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var arp = response.arp;
      if (!arp) {
        return;
      }
      var ARPKey = _getARPKey();

      try {
        var arpFromStorage = StorageManager.read(ARPKey) || {};
        for (var key in arp) {
          if (arp.hasOwnProperty(key)) {
            if (arp[key] === -1) {
              delete arpFromStorage[key];
            } else {
              arpFromStorage[key] = arp[key];
            }
          }
        }
        StorageManager.save(ARPKey, arpFromStorage);
      } catch (e) {
        Utils.log.error("Unable to parse ARP JSON: " + e);
      }
    }
  }, {
    key: '_addARPToRequest',
    value: function _addARPToRequest(url) {
      var ARPKey = _getARPKey();
      if (!ARPKey) {
        return url;
      }
      var arp = StorageManager.read(ARPKey);
      if (arp) {
        return this._addToURL(url, 'arp', Helpers.compressData(JSON.stringify(arp)));
      }
      return url;
    }
  }, {
    key: '_addToURL',
    value: function _addToURL(url, k, v) {
      return url + "&" + k + "=" + encodeURIComponent(v);
    }
  }]);
  return QueueManager;
}();

var _eventsMap;
var _profilesMap;

var _generateEvent = function _generateEvent(type, callback) {
  var data = {
    type: type,
    ep: Utils.getNow()
  };
  if (callback) {
    callback(data);
  }
};

var _generateAppLaunchedEvent = function _generateAppLaunchedEvent(callback) {
  _generateEvent(Constants.EVENT_TYPES.EVENT, function (data) {
    data.evtName = Constants.APP_LAUNCHED;
    data.evtData = {
      "SDK Version": version
    };
    if (Account.getAppVersion()) {
      data.evtData.Version = '' + Account.getAppVersion();
    }

    if (callback) {
      callback(data);
    }
  });
};

var CleverTapAPI = function () {
  function CleverTapAPI(options) {
    classCallCheck(this, CleverTapAPI);

    this.options = options;
    this.queueManager = new QueueManager(Object.assign({}, this.options));
    this._newSession();
  }

  createClass(CleverTapAPI, [{
    key: 'getCleverTapID',
    value: function getCleverTapID() {
      return Device.getGUID();
    }
  }, {
    key: 'getTimeElapsed',
    value: function getTimeElapsed() {
      if (!this._isPersonalizationActive()) {
        return 0;
      }
      return this.session.getTimeElapsed();
    }
  }, {
    key: 'getPageCount',
    value: function getPageCount() {
      if (!this._isPersonalizationActive()) {
        return 0;
      }
      return this.session.getPageCount();
    }
  }, {
    key: 'getTotalVisits',
    value: function getTotalVisits() {
      if (!this._isPersonalizationActive()) {
        return 0;
      }
      return this.session.getTotalVisits();
    }
  }, {
    key: 'getLastVisit',
    value: function getLastVisit() {
      if (!this._isPersonalizationActive()) {
        return 0;
      }
      return this.session.getLastVisit();
    }
  }, {
    key: 'getEventDetails',
    value: function getEventDetails(evtName) {
      if (!this._isPersonalizationActive()) {
        return;
      }
      var evtObj = this._getEventsMap()[evtName];
      if (!evtObj) {
        return null;
      }
      var respObj = {};
      respObj.firstTime = new Date(evtObj[1] * 1000);
      respObj.lastTime = new Date(evtObj[2] * 1000);
      respObj.count = evtObj[0];
      return respObj;
    }
  }, {
    key: 'getProfileAttribute',
    value: function getProfileAttribute(propName) {
      if (!this._isPersonalizationActive()) {
        return;
      }
      return this._getProfilesMap()[propName];
    }
  }, {
    key: 'processEvent',
    value: function processEvent(data) {
      if (!Utils.isObject(data)) {
        return;
      }
      if (data.type === Constants.EVENT_TYPES.EVENT) {
        this._addToLocalEventMap(data.evtName);
      }

      if (data.type === Constants.EVENT_TYPES.PROFILE) {
        this._addToLocalProfileMap(data.profile);
      }
      data = this._addSystemDataToObject(data, undefined);
      this.queueManager.queueEvent(data);
    }
  }, {
    key: 'onUserLogin',
    value: function onUserLogin(argsArray) {
      var _this2 = this;

      var profileObj = ProfileHandler.generateProfileObj(argsArray);
      var currentGUID = Device.getGUID();

      if (!currentGUID || !profileObj) {
        return;
      }

      var identifiers = ProfileHandler.extractIdentifiersFromProfileObj(profileObj) || [];
      var haveIdentifier = identifiers.length > 0;

      var cachedGUID;
      for (var index = 0; index < identifiers.length; index++) {
        var identifier = identifiers[index];
        if (!identifier.type || !identifier.id) {
          continue;
        }
        cachedGUID = ProfileHandler.getCachedGUIDForIdentity(identifier.type, identifier.id);
        if (cachedGUID) {
          break;
        }
      }

      // if no identifier provided or there are no identified users on the device; just push on the current profile
      if (!haveIdentifier || Utils.isAnonymousDevice()) {
        Utils.log.debug('onUserLogin: either don\'t have identifier or device is anonymous, associating profile ' + JSON.stringify(profileObj) + ' with current user profile');
        this._processProfileEvent(profileObj);
        return;
      }

      // if profile maps to current guid, push on current profile
      if (cachedGUID && cachedGUID === currentGUID) {
        Utils.log.debug('onUserLogin: profile ' + JSON.stringify(profileObj) + ' maps to current device id ' + currentGUID + ', using current user profile');
        this._processProfileEvent(profileObj);
        return;
      }

      if (this.processingUserLogin) {
        Utils.log.debug('Already processing onUserLogin for ' + this.processingUserLoginKey + ' , will not process for profile: ' + JSON.stringify(profileObj));
        return;
      }

      this.processingUserLogin = true;
      this.processingUserLoginKey = JSON.stringify(profileObj);

      // reset profile, creating or restoring guid
      Utils.log.debug('Processing onUserLogin for ' + this.processingUserLoginKey);

      // clear any events in the queue
      // wait for callback to configure new GUID/session
      this.queueManager.clearEvents(function () {
        // create or update guid
        if (cachedGUID) {
          Device.setGUID(cachedGUID);
        } else {
          Device.generateGUID();
        }
        // clear old profile data
        _this2._clearDataMaps();
        // new session
        _this2._newSession();
        // process profile event
        _this2._processProfileEvent(profileObj);
        // reset flags
        _this2.processingUserLogin = false;
        _this2.processingUserLoginKey = null;
      });
    }
  }, {
    key: '_newSession',
    value: function _newSession() {
      this.session = new Session(Object.assign({}, this.options));
      this._generateLaunchEvents();
    }
  }, {
    key: '_generateLaunchEvents',
    value: function _generateLaunchEvents() {
      var _this3 = this;

      _generateAppLaunchedEvent(function (data) {
        _this3.processEvent(data);
      });
      if (this.options.sendPages) {
        _generateEvent(Constants.EVENT_TYPES.PAGE, function (data) {
          _this3.processEvent(data);
        });
      }
    }
  }, {
    key: '_getEventsMap',
    value: function _getEventsMap() {
      if (!_eventsMap) {
        var EVKey = StorageManager.getUserEventsKey();
        _eventsMap = StorageManager.read(EVKey) || {};
      }
      return _eventsMap;
    }
  }, {
    key: '_getProfilesMap',
    value: function _getProfilesMap() {
      if (!_profilesMap) {
        var PRKey = StorageManager.getUserProfileKey();
        _profilesMap = StorageManager.read(PRKey) || {};
      }
      return _profilesMap;
    }
  }, {
    key: '_clearDataMaps',
    value: function _clearDataMaps() {
      _eventsMap = null;
      _profilesMap = null;
    }
    // currently not used

  }, {
    key: '_startPings',
    value: function _startPings() {
      if (this.options.sendPings) {
        var _this = this;
        setInterval(function () {
          _generateEvent(Constants.EVENT_TYPES.PING, function (data) {
            _this.processEvent(data);
          });
        }, Constants.PING_FREQ_IN_MILLIS);
      }
    }
  }, {
    key: '_isPersonalizationActive',
    value: function _isPersonalizationActive() {
      return this.options.enablePersonalization;
    }
  }, {
    key: '_processProfileEvent',
    value: function _processProfileEvent(profileObj) {
      var data = ProfileHandler.generateProfileEvent(profileObj);
      this.processEvent(data);
    }
  }, {
    key: '_addToLocalEventMap',
    value: function _addToLocalEventMap(evtName) {
      if (!evtName) {
        return;
      }
      var eventsMap = this._getEventsMap();
      var nowTs = Utils.getNow();
      var evtDetail = eventsMap[evtName];
      if (evtDetail) {
        evtDetail[2] = nowTs;
        evtDetail[0]++;
      } else {
        evtDetail = [];
        evtDetail.push(1);
        evtDetail.push(nowTs);
        evtDetail.push(nowTs);
      }
      eventsMap[evtName] = evtDetail;
      var EVKey = StorageManager.getUserEventsKey();
      StorageManager.save(EVKey, eventsMap);
    }
  }, {
    key: '_addToLocalProfileMap',
    value: function _addToLocalProfileMap(profileObj) {
      if (!profileObj) {
        return;
      }
      var profilesMap = this._getProfilesMap();

      //Move props from custom bucket to outside.
      if (profileObj._custom) {
        var keys = profileObj._custom;
        for (var key in keys) {
          if (keys.hasOwnProperty(key)) {
            profileObj[key] = keys[key];
          }
        }
        delete profileObj._custom;
      }

      for (var prop in profileObj) {
        if (profileObj.hasOwnProperty(prop)) {
          profilesMap[prop] = profileObj[prop];
        }
      }
      if (profilesMap._custom) {
        delete profilesMap._custom;
      }
      var PRKey = StorageManager.getUserProfileKey();
      StorageManager.save(PRKey, profilesMap);
    }
  }, {
    key: '_addSystemDataToObject',
    value: function _addSystemDataToObject(dataObject, ignoreTrim) {
      // ignore trim for chrome notifications; undefined everywhere else
      if (!ignoreTrim) {
        dataObject = Utils.removeUnsupportedChars(dataObject, function (errorCode, errorMessage) {
          Utils.reportError(errorCode, errorMessage);
        });
      }
      var error = ErrorManager.popError();
      if (error) {
        dataObject.wzrk_error = error;
      }
      dataObject.id = Account.getAccountId();
      if (Device.getGUID()) {
        dataObject.g = Device.getGUID();
      }
      dataObject.s = Session.getSessionId();
      dataObject.pg = this.session.getPageCount();
      // firstTime flag
      dataObject.f = this.session.isFirstSession();
      return dataObject;
    }
  }]);
  return CleverTapAPI;
}();

var _eventQueue = [];

var _processEventArray = function _processEventArray(eventArr) {
    if (!Utils.isArray(eventArr)) {
        return;
    }

    var _errorCallback = function _errorCallback(code, message) {
        Utils.reportError(code, message);
    };

    var data = null;

    while (eventArr.length > 0) {
        var eventName = eventArr.shift(); // take out name of the event

        if (!Utils.isString(eventName)) {
            Utils.log.error(ErrorManager.MESSAGES.event);
            return;
        }

        if (eventName.length > 1024) {
            eventName = eventName.substring(0, 1024);
            Utils.reportError(510, eventName + "... length exceeded 1024 chars. Trimmed.");
        }

        if (eventName === "Stayed" || eventName === "UTM Visited" || eventName === "App Launched" || eventName === "Notification Sent" || eventName === "Notification Viewed" || eventName === "Notification Clicked") {
            Utils.reportError(513, eventName + " is a restricted system event. It cannot be used as an event name.");
            continue;
        }

        data = {
            type: Constants.EVENT_TYPES.EVENT,
            ep: Utils.getNow(),
            evtName: Utils.sanitize(eventName, Utils.unsupportedKeyCharRegex)
        };

        if (eventArr.length !== 0) {
            var eventObj = eventArr.shift();

            if (!Utils.isObject(eventObj)) {
                eventArr.unshift(eventObj); // put it back if it is not an object
            } else {
                //check Charged Event vs. other events.
                if (eventName === "Charged") {
                    if (!Validator.isChargedEventStructureValid(eventObj), _errorCallback) {
                        Utils.reportError(511, "Charged event structure invalid. Not sent.");
                        continue;
                    }
                } else {
                    if (!Validator.isEventStructureFlat(eventObj)) {
                        Utils.reportError(512, eventName + " event structure invalid. Not sent.");
                        continue;
                    }
                }
                data.evtData = eventObj;
            }
        }
    }
    return data;
};

var EventHandler = function () {
    function EventHandler(api, cachedQueue) {
        classCallCheck(this, EventHandler);

        this.api = api;

        _eventQueue.push = function (argsArray) {
            var data = _processEventArray(argsArray);
            this.api.processEvent(data);
        }.bind(this);

        if (cachedQueue && cachedQueue.length > 0) {
            for (var index = 0; index < cachedQueue.length; index++) {
                this.push(cachedQueue[index]);
            }
        }
    }

    createClass(EventHandler, [{
        key: 'push',
        value: function push() {
            //since arguments is not an array, convert it into an array
            _eventQueue.push(Array.prototype.slice.call(arguments));
            return true;
        }
    }, {
        key: 'getDetails',
        value: function getDetails(evtName) {
            return this.api.getEventDetails(evtName);
        }
    }]);
    return EventHandler;
}();

var _domain = 'wzrkt.com';

var OPTIONS = {
  domain: _domain,
  protocol: 'https:',
  enablePersonalization: true,
  eventUploadInterval: 1 * 1000, // 1s
  eventUploadThreshold: 50,
  maxSavedEventCount: 1000,
  uploadBatchSize: 50,
  sendPages: false,
  sendPings: false
};

var SessionHandler = function () {
  function SessionHandler(api) {
    classCallCheck(this, SessionHandler);

    this.api = api;
  }

  createClass(SessionHandler, [{
    key: "getTimeElapsed",
    value: function getTimeElapsed() {
      return this.api.getTimeElapsed();
    }
  }, {
    key: "getPageCount",
    value: function getPageCount() {
      return this.api.getPageCount();
    }
  }]);
  return SessionHandler;
}();

var UserHandler = function () {
  function UserHandler(api) {
    classCallCheck(this, UserHandler);

    this.api = api;
  }

  createClass(UserHandler, [{
    key: "getTotalVisits",
    value: function getTotalVisits() {
      return this.api.getTotalVisits();
    }
  }, {
    key: "getLastVisit",
    value: function getLastVisit() {
      return this.api.getLastVisit();
    }
  }]);
  return UserHandler;
}();

var _userLoginQueue = [];

var UserLoginHandler = function () {
  function UserLoginHandler(api, cachedQueue) {
    classCallCheck(this, UserLoginHandler);

    this.api = api;

    _userLoginQueue.push = function (argsArray) {
      this.api.onUserLogin(argsArray);
    }.bind(this);

    if (cachedQueue && cachedQueue.length > 0) {
      for (var index = 0; index < cachedQueue.length; index++) {
        this.push(cachedQueue[index]);
      }
    }
  }

  createClass(UserLoginHandler, [{
    key: "push",
    value: function push() {
      //since arguments is not an array, convert it into an array
      _userLoginQueue.push(Array.prototype.slice.call(arguments));
      return true;
    }
  }]);
  return UserLoginHandler;
}();

var CleverTap = function () {
  function CleverTap() {
    var old = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, CleverTap);

    this.options = Object.assign({}, OPTIONS);
    this.event = old.event || [];
    this.profile = old.profile || [];
    this.onUserLogin = old.onUserLogin || [];
    this.logLevels = Utils.logLevels;
  }

  createClass(CleverTap, [{
    key: 'init',
    value: function init(id, region) {
      if (Utils.isEmptyString(id)) {
        Utils.log.error(ErrorManager.MESSAGES.init);
        return;
      }
      Account.setAccountId(id);
      Account.setRegion(region);
      this.api = new CleverTapAPI(Object.assign({}, this.options));
      this.session = new SessionHandler(this.api);
      this.user = new UserHandler(this.api);
      this.onUserLogin = new UserLoginHandler(this.api, this.onUserLogin);
      this.event = new EventHandler(this.api, this.event);
      this.profile = new ProfileHandler(this.api, this.profile);
    }
  }, {
    key: 'getCleverTapID',
    value: function getCleverTapID() {
      return this.api.getCleverTapID();
    }
  }, {
    key: 'setLogLevel',
    value: function setLogLevel(levelName) {
      Utils.setLogLevel(levelName);
    }
  }, {
    key: 'getLogLevel',
    value: function getLogLevel() {
      return Utils.getLogLevel();
    }
  }, {
    key: 'setAppVersion',
    value: function setAppVersion(version) {
      Account.setAppVersion(version);
    }
  }, {
    key: 'getAppVersion',
    value: function getAppVersion() {
      return Account.getAppVersion();
    }
  }]);
  return CleverTap;
}();

var main = new CleverTap(window.clevertap);

return main;

})));
