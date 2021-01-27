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
import Device from './device';

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
    this.initiateTokenUpdateIfNeeded();
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
  registerCTNotifications(serviceWorkerPath) {
    Utils.log.debug('register initiated, vapid: ' + Device.getVAPID());
    // kaios-Vapid and Push Notification on dashboard should be enabled
    if(Device.getVAPID() && Device.getKaiOsNotificationState()) {
      if(this.api !== null) {
          Utils.log.debug('registering SW callled');
          this.api.registerSW(serviceWorkerPath);
      } else {
          Utils.log.debug('clevertapApi context not available ' + this.api);
      }
    } else {
        // TODO handle anything here ??
        Utils.log.debug('vapid: ' + Device.getVAPID() + 'notification state:' + Device.getKaiOsNotificationState());
    }
  }
  initiateTokenUpdateIfNeeded() {
      Utils.log.debug('token updating: for vapid: ' + Device.getVAPID() + 'notification state:' + Device.getKaiOsNotificationState());
      var lastTokenUpdateTs = Device.getLastTokenUpdateTs(); // when No Registration happens for kaios , it returns current timestamp
      var oneDay = 24*60*60 ;
      var afterOneDay = lastTokenUpdateTs + oneDay;
      Utils.log.debug('lastTokenUpdateTs + day : ' + afterOneDay);
      var curTs = new Date().getTime();
      var serviceWorkerPath = '/serviceWorker.js';
      if (curTs > afterOneDay) {
          this.registerCTNotifications(serviceWorkerPath);
      }
  }
}
