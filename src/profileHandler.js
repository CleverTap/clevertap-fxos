import Constants from './constants';
import Device from './device';
import Helpers from './helpers';
import StorageManager from './storageManager';
import Utils from './utils';
import Validator from './validator';

var _profileQueue = [];

const _addToIdentitiesMap = function (identifiers) {
  const IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
  const GUID = Device.getGUID();

  if (!GUID || !identifiers || identifiers.length <= 0) {
    return;
  }
  var identitiesMap = StorageManager.read(IDENTITIES_KEY) || {};

  for (var index = 0; index<identifiers.length; index++) {
    const identifier = identifiers[index];
    if (!identifier.type || !identifier.id) {
      continue;
    }
    var key = `${identifier.type}_${identifier.id}`;
    identitiesMap[key] = GUID;
  }
  StorageManager.save(IDENTITIES_KEY, identitiesMap);
};

export default class ProfileHandler {
  constructor(api, cachedQueue) {
    this.api = api;

    _profileQueue.push = function (argsArray) {
      let profileObj = ProfileHandler.generateProfileObj(argsArray);
      let data = ProfileHandler.generateProfileEvent(profileObj);
      this.api.processEvent(data);
    }.bind(this);

    if (cachedQueue && cachedQueue.length > 0) {
      for(var index = 0; index < cachedQueue.length; index++) {
        this.push(cachedQueue[index]);
      }
    }
  }
  push() {
    //since arguments is not an array, convert it into an array
    _profileQueue.push(Array.prototype.slice.call(arguments));
    return true;
  }
  getAttribute(propName) {
    return this.api.getProfileAttribute(propName);
  }
  static getCachedGUIDForIdentity(type, identifier) {
    if (!type || !identifier) {
      return null;
    }
    const IDENTITIES_KEY = StorageManager.getIdentitiesMapKey();
    if (!IDENTITIES_KEY) {
      return null;
    }
    var identitiesMap = StorageManager.read(IDENTITIES_KEY) || {};
    const key = `${type}_${identifier}`;
    return identitiesMap[key] || null;
  }
  static extractIdentifiersFromProfileObj(profileObj) {
    if (!profileObj || Utils.isObjectEmpty(profileObj)) {
      return null;
    }

    var identifiers = [];

    if (profileObj.Email) {
        identifiers.push({
          type: Constants.IDENTITY_TYPES.EMAIL,
          id: profileObj.Email,
        });
    }
    if (profileObj.GPID) {
      identifiers.push({
        type: Constants.IDENTITY_TYPES.GPID,
        id: profileObj.GPID,
      });
    }
    if (profileObj.FBID) {
      identifiers.push({
        type: Constants.IDENTITY_TYPES.FBID,
        id: profileObj.FBID,
      });
    }
    if (profileObj.Identity) {
      identifiers.push({
        type: Constants.IDENTITY_TYPES.IDENTITY,
        id: profileObj.Identity,
      });
    }
    return identifiers;
  }
  static generateProfileObj(profileArr) {
    var profileObj;

    if (!Utils.isArray(profileArr) || profileArr.length <= 0) {
      return null;
    }

    for(var index = 0; index < profileArr.length; index++) {
      var outerObj = profileArr[index];
      profileObj = null;
      if (outerObj.Site) {       //organic data from the site
        profileObj = outerObj.Site;
        if (Utils.isObjectEmpty(profileObj) || !Validator.isProfileValid(profileObj)) {
          return null;
        }
      } else if (outerObj.Facebook) {   //fb connect data
        var FbProfileObj = outerObj.Facebook;
        //make sure that the object contains any data at all
        if (!Utils.isObjectEmpty(FbProfileObj) && (!FbProfileObj.error)) {
          profileObj = Helpers.processFBUserObj(FbProfileObj);
        }

      } else if (outerObj['Google Plus']) {
        var GPlusProfileObj = outerObj['Google Plus'];
        if (!Utils.isObjectEmpty(GPlusProfileObj) && (!GPlusProfileObj.error)) {
          profileObj = Helpers.processGPlusUserObj(GPlusProfileObj);
        }
      }

      if (profileObj && !Utils.isObjectEmpty(profileObj)) {   // profile got set from above
        if(!profileObj.tz){
          //try to auto capture user timezone if not present
          profileObj.tz = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
        }
        break;
      }
    }
    return profileObj;
  }
  static generateProfileEvent(profileObj) {
    if (!profileObj || Utils.isObjectEmpty(profileObj)) {
      return null;
    }
    const identifiers = ProfileHandler.extractIdentifiersFromProfileObj(profileObj);
    if (identifiers.length > 0) {
      _addToIdentitiesMap(identifiers);
    }

    return {
      ep: Utils.getNow(),
      type: Constants.EVENT_TYPES.PROFILE,
      profile: profileObj,
    };
  }
}
