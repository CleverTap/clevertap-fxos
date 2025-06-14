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
import Constants from './constants';

export default class CleverTap {
  constructor(old={}) {
    this.options = Object.assign({}, OPTIONS);
    this.event = old.event || [];
    this.profile = old.profile || [];
    this.onUserLogin = old.onUserLogin || [];
    this.logLevels = Utils.logLevels;
    this.swpath = '/serviceWorker.js';
  }
  init(id, region, config = {}) {
    if (Utils.isEmptyString(id)) {
      Utils.log.error(ErrorManager.MESSAGES.init);
      return;
    }
    Account.setAccountId(id);
    Account.setRegion(region);
    if(Device.getVAPIDState() === null){
      Device.setVAPIDState(false);
    }

    /* Override default options with custom domain */
    if(config.hasOwnProperty('domain') && Utils.isValidDomain(config.domain)){
      this.options.domain = config.domain;

      /* This will remove the old redirect header if present */
      if(localStorage.getItem(Constants.REDIRECT_HEADER) && !localStorage.getItem(Constants.CUSTOM_DOMAIN)){
        localStorage.removeItem(Constants.REDIRECT_HEADER);
      }

      localStorage.setItem(Constants.CUSTOM_DOMAIN, config.domain);
    } else {
      localStorage.removeItem(Constants.CUSTOM_DOMAIN);
    }

    this.api = new CleverTapAPI(Object.assign({}, this.options));
    this.session = new SessionHandler(this.api);
    this.user = new UserHandler(this.api);
    this.onUserLogin = new UserLoginHandler(this.api, this.onUserLogin);
    this.event = new EventHandler(this.api, this.event);
    this.profile = new ProfileHandler(this.api, this.profile);
    this._initiateTokenUpdateIfNeeded();
  }
  setSWPath(swpath) {
      this.swpath = swpath ;
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

  _registerCTNotifications(serviceWorkerPath,unregister) {
      if(!serviceWorkerPath) {
          serviceWorkerPath = this.swpath;
      } else {
          this.swpath = serviceWorkerPath;
      }
    Utils.log.debug('register initiated, vapid: ' + Device.getVAPID());

    // kaios-Vapid and Push Notification on dashboard should be enabled
    console.log('Device VAPID State '+ Device.getVAPIDState());
    if(Device.getVAPIDState()){
      if(Device.getVAPID() && Device.getKaiOsNotificationState()) {
        if(this.api !== null) {
            Utils.log.debug('registering SW callled');
            this.api.registerSW(serviceWorkerPath,unregister);
        } else {
            Utils.log.debug('clevertap-Api context not available ' + this.api);
        }
      } else {
          Utils.log.debug('Service Worker Subscription from client failed: Vapid-key: ' + Device.getVAPID() + ' Notification Enabled:' + Device.getKaiOsNotificationState());
      }
    }else{
      Utils.log.debug('setting timeout and calling _registerCTNotifications again in 2s');
      setTimeout(() => {
        this._registerCTNotifications(serviceWorkerPath,unregister);
      },2000);
    }
    
  }
    unregisterCTNotifications(serviceWorkerPath) {
        this._registerCTNotifications(serviceWorkerPath,true);
    }
    registerCTNotifications(serviceWorkerPath) {
        this._registerCTNotifications(serviceWorkerPath,false);
    }
    _initiateTokenUpdateIfNeeded () {
        Utils.log.debug('token updating: for vapid: ' + Device.getVAPID() + 'notification state:' + Device.getKaiOsNotificationState());
        var lastTokenUpdateTs = Device.getLastTokenUpdateTs(); // when No Registration happens for kaios , it returns current timestamp
        // If Registration tried by user do registration on every app launch..
        if (lastTokenUpdateTs !== null) {
            Utils.log.debug('Updating token initated on app launch');
            this._registerCTNotifications(this.swpath,false);
        }
    }
}
