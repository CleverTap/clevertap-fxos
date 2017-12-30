import Constants from './constants';
import ErrorManager from './errorManager';
import StorageManager from './storageManager';
import Utils from './utils';

let _globalChargedId;

//events can't have any nested structure or arrays
const isEventStructureFlat = function (eventObj) {
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

const isProfileValid = function (profileObj) {
    var valid = true;
    if (Utils.isObject(profileObj)) {
        for (var profileKey in profileObj) {
            if (profileObj.hasOwnProperty(profileKey)) {
                var profileVal = profileObj[profileKey];

                if (typeof profileVal === Constants.UNDEFINED) {
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

                if (profileKey === 'Age' && typeof profileVal !== Constants.UNDEFINED) {
                    if (Utils.isConvertibleToNumber(profileVal)) {
                        profileObj.Age = +profileVal;
                    } else {
                        valid = false;
                        Utils.log.error(ErrorManager.MESSAGES.age);
                    }
                }

                // dob will come in like this - $dt_19470815 or dateObject
                if (profileKey === 'DOB') {
                    if (((!(/^\$D_/).test(profileVal) || (profileVal + "").length !== 11)) && !Utils.isDateObject(profileVal)) {
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
                    if (profileVal.length > 8 && (profileVal.charAt(0) === '+')) { // valid phone number
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

const isChargedEventStructureValid = function (chargedObj, callback) {
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
                        if (chargedObj[key].hasOwnProperty(itemKey)) {    // since default array implementation could be overridden - e.g. Teabox site
                            if (!Utils.isObject(chargedObj[key][itemKey]) || !isEventStructureFlat(chargedObj[key][itemKey])) {
                                return false;
                            }
                        }
                    }
                } else { //Items
                    if (Utils.isObject(chargedObj[key]) || Utils.isArray(chargedObj[key])) {
                        return false;
                    } else if (Utils.isDateObject(chargedObj[key])) {
                        chargedObj[key] = Utils.convertToWZRKDate(chargedObj[key]);
                    }

                } // if key == Items
            }
        } //for..
        //save charged Id
        if (typeof chargedObj[Constants.CHARGED_ID] !== Constants.UNDEFINED) {
            var chargedId = chargedObj[Constants.CHARGED_ID];
            const CHARGEDIDKey = StorageManager.getChargedIdKey();
            if (typeof _globalChargedId === Constants.UNDEFINED) {
              _globalChargedId = StorageManager.read(CHARGEDIDKey);
            }
            if (typeof _globalChargedId !== Constants.UNDEFINED && _globalChargedId === chargedId) {
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

export default {
  isEventStructureFlat,
  isProfileValid,
  isChargedEventStructureValid,
};
