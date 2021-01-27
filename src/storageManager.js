import Account from './account';
import Constants from './constants';
import Device from './device';
import Utils from './Utils';

export default class StorageManager {
  static save(key, value) {
    if (!key || !value) {
      return;
    }
    Utils.saveToStorage(key, value);
  }
  static read(key) {
    if (!key) {
      return null;
    }
    return Utils.readFromStorage(key);
  }
  static remove(key) {
    if (!key) {
      return;
    }
    Utils.removeFromStorage(key);
  }
  static getVAPIDKey() {
      const accountId = Account.getAccountId();
      if (!accountId)  {
          return null;
      }
      return `${Constants.VAPID_KEY}_${accountId}`;
  }
  static getTokenUpdateTsKey(){
      const accountId = Account.getAccountId();
      if (!accountId)  {
          return null;
      }
      return `${Constants.TOKEN_UPDATE_TS_KEY}_${accountId}`;
  }
    static getKaiosNotificationStateKey(){
        const accountId = Account.getAccountId();
        if (!accountId)  {
            return null;
        }
        return `${Constants.KAIOS_NOTIFICATION_STATE}_${accountId}`;
    }

  static getGUIDKey() {
    const accountId = Account.getAccountId();
    if (!accountId)  {
      return null;
    }
    return `${Constants.GCOOKIE_NAME}_${accountId}`;
  }
  static getSessionKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid)  {
      return null;
    }
    return `${Constants.SCOOKIE_PREFIX}_${accountId}_${guid}`;
  }
  static getUserEventsKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid)  {
      return null;
    }
    return `${Constants.EV_COOKIE}_${accountId}_${guid}`;
  }
  static getUserProfileKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid) {
      return null;
    }
    return `${Constants.PR_COOKIE}_${accountId}_${guid}`;
  }
  static getSavedEventsKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid) {
      return null;
    }
    return `${Constants.ECOOKIE_PREFIX}_${accountId}_${guid}`;
  }
  static getSavedProfilesKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid) {
      return null;
    }
    return `${Constants.PCOOKIE_PREFIX}_${accountId}_${guid}`;
  }
  static getSavedSequenceNumberKey() {
    const accountId = Account.getAccountId();
    if (!accountId) {
      return null;
    }
    return `${Constants.SEQCOOKIE_PREFIX}_${accountId}`;
  }
  static getARPKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid) {
      return null;
    }
    return `${Constants.ARP_COOKIE}_${accountId}_${guid}`;
  }
  static getMetaKey() {
    const accountId = Account.getAccountId();
    const guid = Device.getGUID();
    if (!accountId || !guid) {
      return null;
    }
    return `${Constants.META_COOKIE}_${accountId}_${guid}`;
  }
  static getIdentitiesMapKey() {
    const accountId = Account.getAccountId();
    if (!accountId) {
      return null;
    }
    return `${Constants.KCOOKIE_NAME}_${accountId}`;
  }
  static getChargedIdKey() {
    const accountId = Account.getAccountId();
    if (!accountId) {
      return null;
    }
    return `${Constants.CHARGED_ID}_${accountId}`;
  }
}
