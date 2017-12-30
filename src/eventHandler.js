import Constants from './constants';
import ErrorManager from './errorManager';
import Utils from './utils';
import Validator from './validator';

var _eventQueue = [];

const _processEventArray = function (eventArr) {
  if (!Utils.isArray(eventArr)) {
    return;
  }

  const _errorCallback = function (code, message) {
      Utils.reportError(code, message);
  };

  var data = null;

  while (eventArr.length > 0) {
    var eventName = eventArr.shift(); // take out name of the event

    if (!Utils.isString(eventName)) {
        Utils.log.error(ErrorManager.MESSAGES.event);
        return;
    }

    if (eventName.length > 1024) {
        eventName = eventName.substring(0, 1024);
        Utils.reportError(510, eventName + "... length exceeded 1024 chars. Trimmed.");
    }

    if (eventName === "Stayed" || eventName === "UTM Visited" || eventName === "App Launched" ||
        eventName === "Notification Sent" || eventName === "Notification Viewed" || eventName === "Notification Clicked") {
        Utils.reportError(513, eventName + " is a restricted system event. It cannot be used as an event name.");
        continue;
    }

    data = {
      type: Constants.EVENT_TYPES.EVENT,
      ep: Utils.getNow(),
      evtName: Utils.sanitize(eventName, Utils.unsupportedKeyCharRegex),
    };

    if (eventArr.length !== 0) {
        var eventObj = eventArr.shift();

        if (!Utils.isObject(eventObj)) {
            eventArr.unshift(eventObj);    // put it back if it is not an object
        } else {
            //check Charged Event vs. other events.
            if (eventName === "Charged") {
                if (!Validator.isChargedEventStructureValid(eventObj), _errorCallback) {
                    Utils.reportError(511, "Charged event structure invalid. Not sent.");
                    continue;
                }
            } else {
                if (!Validator.isEventStructureFlat(eventObj)) {
                    Utils.reportError(512, eventName + " event structure invalid. Not sent.");
                    continue;
                }
            }
            data.evtData = eventObj;
        }
    }
  }
  return data;
};

export default class EventHandler {
  constructor(api, cachedQueue) {
    this.api = api;

    _eventQueue.push = function (argsArray) {
      let data = _processEventArray(argsArray);
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
    _eventQueue.push(Array.prototype.slice.call(arguments));
    return true;
  }
  getDetails(evtName) {
    return this.api.getEventDetails(evtName);
  }
}
