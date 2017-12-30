import StorageManager from './storageManager';
import Utils from './utils';

var _sessionId = 0;
var _previousSessionId = 0;
var _sessionCount = 0;
var _pageCount = 0;
var _isFirstSession;

const _getStorageKey = function () {
  return StorageManager.getSessionKey();
};

const _readSessionObject = function () {
  const storageKey = _getStorageKey();
  var obj = StorageManager.read(storageKey) || {};
  if (!Utils.isObject(obj)) {
      obj = {};
  }
  return obj;
};

const _saveSessionObject = function(obj) {
  const storageKey = _getStorageKey();
  StorageManager.save(storageKey, obj);
};

export default class Session {
  constructor(options={}) {
    this.options = options;
    _sessionId = Utils.getNow();
    var sessionObj = _readSessionObject();
    _previousSessionId = sessionObj.ps || 0;
    _isFirstSession = _previousSessionId <= 0;
    _pageCount = sessionObj.p || 1;  // not updating page counts for now
    _sessionCount = (sessionObj.sc || 0) + 1;
    sessionObj.ps = _sessionId;
    sessionObj.p = _pageCount;
    sessionObj.sc = _sessionCount;
    _saveSessionObject(sessionObj);
  }
  static getSessionId() {
    return _sessionId;
  }
  isFirstSession() {
    return _isFirstSession;
  }
  getPageCount() {
    return _pageCount;
  }
  getTimeElapsed() {
    var sessionStart = Session.getSessionId();
    if (sessionStart <= 0) {
      return 0;
    }
    return Math.floor(Utils.getNow() - sessionStart);
  }
  getTotalVisits() {
    return _sessionCount;
  }
  getLastVisit() {
    return (_previousSessionId > 0) ?  new Date(_previousSessionId*1000) : 0;
  }
}
