import Account from './account';
import Session from './session';
import Constants from './constants';
import Device from './device';
import ErrorManager from './errorManager';
import ProfileHandler from './profileHandler';
import QueueManager from './queueManager';
import StorageManager from './storageManager';
import Utils from './utils';
import version from './version';

var _eventsMap;
var _profilesMap;

const _generateEvent = function (type, callback) {
  var data = {
    type: type,
    ep: Utils.getNow(),
  };
  if (callback) {
    callback(data);
  }
};

const _generateAppLaunchedEvent = function (callback) {
  _generateEvent(Constants.EVENT_TYPES.EVENT, function (data) {
    data.evtName = Constants.APP_LAUNCHED;
    data.evtData = {
      "SDK Version": version,
    };
    if (Account.getAppVersion()) {
      data.evtData.Version = `${Account.getAppVersion()}`;
    }

    if (callback) {
      callback(data);
    }
  });
};

export default class CleverTapAPI {
  constructor(options) {
    this.options = options;
    this.queueManager = new QueueManager(Object.assign({}, this.options));
    this._newSession();
  }
  getCleverTapID() {
    return Device.getGUID();
  }
  getTimeElapsed() {
    if (!this._isPersonalizationActive()) {
        return 0;
    }
    return this.session.getTimeElapsed();
  }
  getPageCount() {
    if (!this._isPersonalizationActive()) {
        return 0;
    }
    return this.session.getPageCount();
  }
  getTotalVisits() {
    if (!this._isPersonalizationActive()) {
        return 0;
    }
    return this.session.getTotalVisits();
  }
  getLastVisit() {
    if (!this._isPersonalizationActive()) {
        return 0;
    }
    return this.session.getLastVisit();
  }
  getEventDetails(evtName) {
    if (!this._isPersonalizationActive()) {
        return;
    }
    var evtObj = this._getEventsMap()[evtName];
    if (!evtObj){
      return null;
    }
    var respObj = {};
    respObj.firstTime = new Date(evtObj[1] * 1000);
    respObj.lastTime = new Date(evtObj[2] * 1000);
    respObj.count = evtObj[0];
    return respObj;
  }
  getProfileAttribute(propName) {
    if (!this._isPersonalizationActive()) {
        return;
    }
    return this._getProfilesMap()[propName];
  }
  processEvent(data) {
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
  onUserLogin(argsArray) {
    let profileObj = ProfileHandler.generateProfileObj(argsArray);
    const currentGUID = Device.getGUID();

    if (!currentGUID || !profileObj) {
      return;
    }

    var identifiers = ProfileHandler.extractIdentifiersFromProfileObj(profileObj) || [];
    var haveIdentifier = identifiers.length > 0;

    var cachedGUID;
    for (var index = 0; index<identifiers.length; index++) {
      const identifier = identifiers[index];
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
        Utils.log.debug(`onUserLogin: either don't have identifier or device is anonymous, associating profile ${JSON.stringify(profileObj)} with current user profile`);
        this._processProfileEvent(profileObj);
        return;
    }

    // if profile maps to current guid, push on current profile
    if (cachedGUID && cachedGUID === currentGUID) {
        Utils.log.debug(`onUserLogin: profile ${JSON.stringify(profileObj)} maps to current device id ${currentGUID}, using current user profile`);
        this._processProfileEvent(profileObj);
        return;
    }

    if (this.processingUserLogin) {
      Utils.log.debug(`Already processing onUserLogin for ${this.processingUserLoginKey} , will not process for profile: ${JSON.stringify(profileObj)}`);
      return;
    }

    this.processingUserLogin = true;
    this.processingUserLoginKey = JSON.stringify(profileObj);

    // reset profile, creating or restoring guid
    Utils.log.debug(`Processing onUserLogin for ${this.processingUserLoginKey}`);

    // un-register kaios-token for this guid
    this.unregisterToken(currentGUID);
    // clear any events in the queue
    // wait for callback to configure new GUID/session
    this.queueManager.clearEvents( () => {
      // create or update guid
      if (cachedGUID) {
        Device.setGUID(cachedGUID);
      } else {
        Device.generateGUID();
      }
      // clear old profile data
      this._clearDataMaps();
      // new session
      this._newSession();
      // process profile event
      this._processProfileEvent(profileObj);
      // reset flags
      this.processingUserLogin = false;
      this.processingUserLoginKey = null;
    });
  }
  unregisterToken(oldguid){
      var data = {};
      data.type = Constants.EVENT_TYPES.DATA;
      data.g = oldguid;
      data.action = "unregister";
      this.queueManager._unregisterTokenApiCall(data);
  }
  _newSession() {
    this.session = new Session(Object.assign({}, this.options));
    this._generateLaunchEvents();
  }
  _generateLaunchEvents() {
    _generateAppLaunchedEvent((data) => {this.processEvent(data);});
    if (this.options.sendPages) {
      _generateEvent(Constants.EVENT_TYPES.PAGE, (data) => {this.processEvent(data);});
    }
  }
    // registers ServiceWorker for clevertap..
    registerSW(serviceWorkerPath,needToUnregister) {
        let swRegistration = null;
        Utils.log.debug('--------->registerSW-->',navigator);
        //unregistration if needed
        // navigator.serviceWorker.getRegistrations().then(function(registrations) {
        //     for(let registration of registrations) {
        //         if(registration.unregister()) {
        //             Utils.log.debug("service worker:", registration);
        //             Utils.log.debug("un-register successfully");
        //         }
        //     } });

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            Utils.log.debug('Service Worker and Push is supported');
            navigator.serviceWorker.register(serviceWorkerPath)
                .then(swReg => {
                    swRegistration = swReg;
                    console.log("Subscription data: ", swReg);
                    console.log('Registration succeeded.');
                    //console.log("update service worker initiated");
                    //swRegistration.update(); // TODO need to check..
                    if(needToUnregister) {
                        swRegistration.unregister().then(function(success) {
                            Utils.log.debug("Service worker unregistered attempt, success: " + success);
                            Device.setLastSWUnregistrationForVersion(Device.getAppVersion());
                        });
                    } else {
                        this.triggerPushSubscription(swRegistration);
                    }
                })
                .catch(function(error) {
                    console.error('Service Worker Error', error);
                });
        } else {
            console.warn('Push messaging is not supported');
        }
    }
    triggerPushSubscription(swRegistration) {
        let publicVapidKey = Device.getVAPID();
        var subscriptionData = {} ;
        console.log("subscribing push notification sw " + publicVapidKey);
        swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
        }).then(subscription =>  {
            console.log("pushManager Subscription data: ", subscription.toJSON());
            console.log("applicationserverykey",subscription.options.applicationServerKey);
            subscriptionData = JSON.parse(JSON.stringify(subscription));
            subscriptionData.endpoint = subscriptionData.endpoint.split('/').pop();
            subscriptionData.browser = 'Kaios';
            this._startuploadPushToken(subscriptionData);
            var curTs = new Date().getTime();
            Device.setLastTokenUpdateTs(curTs);
        });
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
  _startuploadPushToken (subscriptionData) {
      subscriptionData.type = Constants.EVENT_TYPES.DATA;
      this.processEvent(subscriptionData);
  }
  _getEventsMap() {
    if (!_eventsMap) {
      const EVKey = StorageManager.getUserEventsKey();
      _eventsMap = StorageManager.read(EVKey) || {};
    }
    return _eventsMap;
  }
  _getProfilesMap() {
    if (!_profilesMap) {
      const PRKey = StorageManager.getUserProfileKey();
      _profilesMap = StorageManager.read(PRKey) || {};
    }
    return _profilesMap;
  }
  _clearDataMaps() {
    _eventsMap = null;
    _profilesMap = null;
  }
  // currently not used
  _startPings() {
    if (this.options.sendPings) {
      var _this = this;
      setInterval( function () {
        _generateEvent(Constants.EVENT_TYPES.PING, function (data) {_this.processEvent(data);});
      }, Constants.PING_FREQ_IN_MILLIS);
    }
  }
  _isPersonalizationActive() {
    return this.options.enablePersonalization;
  }
  _processProfileEvent(profileObj) {
    let data = ProfileHandler.generateProfileEvent(profileObj);
    this.processEvent(data);
  }
  _addToLocalEventMap(evtName) {
     if (!evtName) {
       return;
     }
     let eventsMap = this._getEventsMap();
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
     const EVKey = StorageManager.getUserEventsKey();
     StorageManager.save(EVKey, eventsMap);
   }
   _addToLocalProfileMap(profileObj) {
     if (!profileObj) {
       return;
     }
     let profilesMap = this._getProfilesMap();

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
     const PRKey = StorageManager.getUserProfileKey();
     StorageManager.save(PRKey, profilesMap);
   }
   _addSystemDataToObject(dataObject, ignoreTrim) {
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
}
