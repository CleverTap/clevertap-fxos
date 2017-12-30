import Account from './account';
import CleverTapAPI from './clevertapAPI';
import EventHandler from './eventHandler';
import ErrorManager from './errorManager';
import OPTIONS from './options';
import ProfileHandler from './profileHandler';
import SessionHandler from './sessionHandler';
import UserHandler from './userHandler';
import UserLoginHandler from './userLoginHandler';
import Utils from './utils';

export default class CleverTap {
  constructor(old={}) {
    this.options = Object.assign({}, OPTIONS);
    this.event = old.event || [];
    this.profile = old.profile || [];
    this.onUserLogin = old.onUserLogin || [];
    this.logLevels = Utils.logLevels;
  }
  init(id, region) {
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
  getCleverTapID() {
    return this.api.getCleverTapID();
  }
  setLogLevel(levelName) {
    Utils.setLogLevel(levelName);
  }
  getLogLevel() {
    return Utils.getLogLevel();
  }
  setAppVersion(version) {
    Account.setAppVersion(version);
  }
  getAppVersion() {
    return Account.getAppVersion();
  }
}
