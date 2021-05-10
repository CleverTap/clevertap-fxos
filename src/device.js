/* jshint bitwise: false, laxbreak: true */

import StorageManager from './storageManager';
import Utils from './utils';

const GUID_PREFIX = "fx";
var _guid = null;

//see https://gist.github.com/jed/982883
const uuid = function (a) {
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      window.crypto.getRandomValues(new Uint8Array(1))[0]  // in which case
      % 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        uuid            // random hex digits
      );
};

export default class Device {
  static setGUID(guid) {
    _guid = guid;
    const GUIDKey = StorageManager.getGUIDKey();
    if (guid === null) {
      StorageManager.remove(GUIDKey);
    } else {
      StorageManager.save(GUIDKey, guid);
    }
  }
  static getGUID() {
    if (!_guid) {
      const GUIDKey = StorageManager.getGUIDKey();
      _guid = StorageManager.read(GUIDKey);
    }
    if (!_guid) {
      Device.generateGUID();
    }
    return _guid;
  }
  static generateGUID() {
    const _uuid = uuid().replace(/[-]/g, "");
    const _g = `${GUID_PREFIX}${_uuid}`;
    Utils.log.debug(`Generating Device ID: ${_g}`);
    Device.setGUID(_g);
  }
   static setVAPID(vapid) {
      const VAPIDKey = StorageManager.getVAPIDKey();
      if (vapid === null) {
          StorageManager.remove(VAPIDKey);
      } else {
          StorageManager.save(VAPIDKey, vapid);
      }
  }
    static getVAPID() {
            const VAPIDKey = StorageManager.getVAPIDKey();
            var _vapid = StorageManager.read(VAPIDKey);
            return _vapid;
    }
     static setLastTokenUpdateTs(curTs) {
      const tsKey = StorageManager.getTokenUpdateTsKey();
      StorageManager.save(tsKey,curTs);
    }
     static getLastTokenUpdateTs() {
        const tsKey = StorageManager.getTokenUpdateTsKey();
        var ts = StorageManager.read(tsKey);
         Utils.log.debug("last updated ts : " + ts);
        // if(ts === null){
        //     return new Date().getTime();
        // }
     return ts;
    }
    static setLastSWUnregistrationForVersion(version) {
        const vKey = StorageManager.getLastUnregisterForVersionKey();
        StorageManager.save(vKey,version);
    }
    static getLastSWUnregistrationForVersion() {
        const vKey = StorageManager.getLastUnregisterForVersionKey();
        var ver = StorageManager.read(vKey);
        if(ver === null){
            Utils.log.debug("no last unregistration has been set, returning current version");
            ver = Device.getAppVersion();
        }
        Utils.log.debug("last unregistered on version : = " + ver);
        return ver;
    }

    static getKaiOsNotificationState(){
        const _key = StorageManager.getKaiosNotificationStateKey();
        var notificaionState = StorageManager.read(_key);
        if(!notificaionState) {
            return false;
        }
        return notificaionState;
    }
    static setKaiOsNotificationState(state){
        const _key = StorageManager.getKaiosNotificationStateKey();
        StorageManager.save(_key,state);
    }
    static getAppVersion() {
        const vKey = StorageManager.getAppVersionKey();
        var ver = StorageManager.read(vKey);
        Utils.log.debug("app version : = " +  ver);
        return ver;
    }
    static setAppVersion(version) {
        const vKey = StorageManager.getAppVersionKey();
        StorageManager.save(vKey,version);
    }
}
