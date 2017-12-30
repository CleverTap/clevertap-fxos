var _accountId = null;
var _region = null;
var _appVersion = null;

export default class Account {
  static setAccountId(accountId) {
    _accountId = accountId;
  }
  static getAccountId() {
    return _accountId;
  }
  static setRegion(region) {
    _region = region;
  }
  static getRegion() {
    return _region;
  }
  static setAppVersion(version) {
    _appVersion = version;
  }
  static getAppVersion() {
    return _appVersion;
  }
}
