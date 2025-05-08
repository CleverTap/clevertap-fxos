import Account from './account';
import Constants from './constants';
import Device from './device';
import Helpers from './helpers';
import Request from './request';
import Session from './session';
import StorageManager from './storageManager';
import Utils from './utils';
import version from './version';

const _loadSavedUnsentEvents = function (unsentKey) {
  var savedUnsentEvents = StorageManager.read(unsentKey);
  if (!Utils.isArray(savedUnsentEvents)) {
    return [];
  }
  return savedUnsentEvents;
};

const _loadSavedSequenceNumber = function (key) {
  var num = StorageManager.read(key) || 0;
  return parseInt(num, 10);
};

const _getSavedEventsKey = function () {
  return StorageManager.getSavedEventsKey();
};

const _getSavedProfilesKey = function () {
  return StorageManager.getSavedProfilesKey();
};

const _getSavedSequenceNumberKey = function () {
  return StorageManager.getSavedSequenceNumberKey();
};

const _getARPKey = function () {
  return StorageManager.getARPKey();
};

export default class QueueManager {
  constructor(options) {
    this.options = options;
    this.options.eventUploadRetryInterval = this.options.eventUploadInterval;
    this._uploading = false;
    this._requestScheduled = false;
    this._unsentEvents = _loadSavedUnsentEvents(_getSavedEventsKey());
    this._unsentProfiles = _loadSavedUnsentEvents(_getSavedProfilesKey());
    this._sequenceNumber = _loadSavedSequenceNumber(_getSavedSequenceNumberKey());
    this._scheduleEvents();
  }
  clearEvents(callback) {
    this._sendEvents( () => {
      this._unsentEvents = [];
      this._unsentProfiles = [];
      this._saveEvents();
      callback();
    });
  }
  queueEvent(data) {
    if (!data) {
      return;
    }
    data._seq = this._nextSequenceNumber();
    var _;
    Utils.log.debug(`Queuing event ${JSON.stringify(data)}`);
    if (data.type === Constants.EVENT_TYPES.PROFILE) {
      _ = this._unsentProfiles.push(data);
    } else {
      _ = this._unsentEvents.push(data);
    }
    this._saveEvents();
    this._scheduleEvents();
  }
  _getEndPoint() {
    if(localStorage.getItem('CT_X-WZRK-RD')){
      return this.options.protocol + '//' + localStorage.getItem('CT_X-WZRK-RD') + '/a2?t=77';
    } else {
      let domain = this.options.domain;
      if (Account.getRegion()) {
        domain = Account.getRegion() + '.' + this.options.domain;
      }
      return this.options.protocol + '//' + domain + '/a2?t=77';
    }
  }
  _unsentCount() {
    return this._unsentEvents.length + this._unsentProfiles.length;
  }
  _scheduleRetry() {
    this.options.eventUploadRetryInterval = this.options.eventUploadRetryInterval*2;
    this._scheduleEvents(null, true);
  }
  _scheduleEvents(callback, retry) {
    if (this._unsentCount() === 0) {
      Utils.log.debug("No events in the queue, not scheduling an event update");
      return false;
    }

    // if we have more than the min events queued send now
    if (this._unsentCount() >= this.options.eventUploadThreshold) {
      this._sendEvents(callback);
      return true;
    }

    // otherwise schdule and event upload
    if (this._requestScheduled) {
      Utils.log.debug("Event upload already scheduled");
      return false;
    }

    this._requestScheduled = true;

    const interval = retry ? this.options.eventUploadRetryInterval : this.options.eventUploadInterval;

    setTimeout(function() {
      this._requestScheduled = false;
      this._sendEvents(callback);
    }.bind(this), interval);

    Utils.log.debug(`Scheduling an event upload in ${interval/1000} seconds`);

    return false;
  }
  _sendEvents(callback) {

    var _willNotSend = false;
    var _message = "";
    if (this._uploading) {
      _willNotSend = true;
      _message = "Already Uploading";
    }
    if (this._unsentCount() <= 0) {
      _willNotSend = true;
      _message = "No events in the queue";
    }
    if (_willNotSend) {
      var _debugMessage = `Skipping events upload: ${_message}`;
      Utils.log.debug(_debugMessage);

      if (typeof callback === 'function') {
        callback(0, _debugMessage);
      }
      return;
    }

    this._uploading = true;

    var url = this._getEndPoint();
    url = this._addToURL(url, 'sn', Utils.getNow()); // send epoch seconds as seq number
    url = this._addARPToRequest(url);
    url = this._addToURL(url, "r", new Date().getTime()); // add epoch millis to beat caching of the URL

    let meta = {
      id: Account.getAccountId(),
      "SDK Version": version,
      s: `${Session.getSessionId()}`,
    };

    if (Account.getAppVersion()) {
      meta.Version = `${Account.getAppVersion()}`;
    }

    const guid = Device.getGUID();

    if (guid) {
      url = this._addToURL(url, "gc", guid);
      meta.g = guid;
    }

    url = this._addToURL(url, "d", Helpers.compressData(JSON.stringify(meta)));

    // fetch events to send
    var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);
    var mergedEvents = this._mergeEventQueues(numEvents);
    var maxEventId = mergedEvents.maxEventId;
    var maxProfilesId = mergedEvents.maxProfilesId;
    var events = mergedEvents.eventsToSend;

    Utils.log.debug(`Sending events: ${JSON.stringify(events)}`);

    var _this = this;
    new Request(url, events).send( function(status, response) {
      _this._uploading = false;
      response = response || {};
      Utils.log.debug(`handling response with status: ${status} and data: ${JSON.stringify(response)}`);

      try {

        if(response.header['X-WZRK-RD'] && !localStorage.getItem('CT_X-WZRK-RD')){
          Utils.log.debug(`Redirect to: ${response.header['X-WZRK-RD']}`);
          localStorage.setItem('CT_X-WZRK-RD', response.header['X-WZRK-RD']);
          return _this._sendEvents(callback);
        } 

        if (status === 200) {
          if (response.g) {
            Device.setGUID(response.g);
          }
          if (response.KVAPID) {
            Utils.log.debug(`kaios vapid recieved: ${response.KVAPID}`);
            Device.setVAPID(response.KVAPID);
          }
          for(var i = 0; i < events.length; i++){
            var event = events[i];
            if(event.evtName === Constants.APP_LAUNCHED){
              Device.setVAPIDState(true);
            }
          }
          
          if (response.hasOwnProperty('kaiosPush')){
              Utils.log.debug(`kaios notification status: ${response.kaiosPush}`);
              Device.setKaiOsNotificationState(response.kaiosPush);
          }
          _this._removeEvents(maxEventId, maxProfilesId);
          _this._saveEvents();
          _this._updateARP(response);

          // Schedule next upload in case there are more in the queue
          if (!_this._scheduleEvents(callback) && typeof callback === 'function') {
            callback(status, response);
          }

        // handle errors
        // request too large
        } else if (status === 413) {
          Utils.log.error('event upload request too large');
          // reduct batch size and try again
          // if just one event remove it and give up
          if (_this.options.uploadBatchSize === 1) {
            _this._removeEvents(maxEventId, maxProfilesId);
          }

          _this.options.uploadBatchSize = Math.ceil(numEvents / 2);
          _this._sendEvents(callback);

        // all other errors
        } else {
          Utils.log.error(`Events upload failed with status ${status}.  Will retry.`);
          _this._scheduleRetry();
          if (typeof callback === 'function') {
            callback(status, response);
          }
        }
      } catch (e) {
        _this._uploading = false;
         Utils.log.error(`Events upload failed: ${e.message}.  Will retry.`);
        _this._scheduleRetry();
      }
    });
  }
    // unregister token for existing user.
    _unregisterTokenApiCall(unregisterData,callback) {

        // this._uploading = true; Do i need this for Kaios ?

        var url = this._getEndPoint();
        url = this._addToURL(url, 'sn', Utils.getNow()); // send epoch seconds as seq number
        url = this._addARPToRequest(url);
        url = this._addToURL(url, "r", new Date().getTime()); // add epoch millis to beat caching of the URL

        let meta = {
            id: Account.getAccountId(),
            "SDK Version": version,
            s: `${Session.getSessionId()}`,
        };

        if (Account.getAppVersion()) {
            meta.Version = `${Account.getAppVersion()}`;
        }

        var guid = unregisterData.g;
        if (guid) {
            url = this._addToURL(url, "gc", guid);
            meta.g = guid;
        }

        Utils.log.debug(`kaios vapid req with request url : ${url} and meta: ${meta}`);

        url = this._addToURL(url, "d", Helpers.compressData(JSON.stringify(meta)));


        Utils.log.debug(`Sending kaios-Token unregister request: ${JSON.stringify(unregisterData)}`);
        var data = [];
        data.push(unregisterData);
        new Request(url,data).send( function(status, response) {
            // _this._uploading = false;
            response = response || {};
            Utils.log.debug(`kaios req handling response with status: ${status} and data: ${JSON.stringify(response)}`);

            try {
                if (status === 200) {

                        //Device.setGUID(response.KVAPID);
                        if (typeof callback === 'function') {
                            callback(); // call callback to register subscription to kaios servers.
                        }
                } else {
                    Utils.log.error(`kaios vapid request failed with status ${status}.`);
                }
            } catch (e) {
                Utils.log.error(`kaios vapid request failed: ${e.message}.`);
            }
        });
    }
    _saveEvents() {
    StorageManager.save(_getSavedEventsKey(), this._unsentEvents);
    StorageManager.save(_getSavedProfilesKey(), this._unsentProfiles);
  }
  _trimEventsQueued(queue) {
    if (queue.length > this.options.maxSavedEventCount) {
      queue.splice(0, queue.length - this.options.maxSavedEventCount);
    }
  }
  _removeEvents(maxEventId, maxProfilesId) {
    this._removeEventsFromQueue('_unsentEvents', maxEventId);
    this._removeEventsFromQueue('_unsentProfiles', maxProfilesId);
  }
  _removeEventsFromQueue(eventQueue, maxId) {
    if (maxId < 0) {
      return;
    }
    var filteredEvents = [];
    for (var i = 0; i < this[eventQueue].length || 0; i++) {
      if (this[eventQueue][i]._seq > maxId) {
        filteredEvents.push(this[eventQueue][i]);
      }
    }
    this[eventQueue] = filteredEvents;
  }
  _nextSequenceNumber() {
    this._sequenceNumber++;
    StorageManager.save(_getSavedSequenceNumberKey(), this._sequenceNumber);
    return this._sequenceNumber;
  }
  _mergeEventQueues(numEvents) {
    var eventsToSend = [];
    var eventIndex = 0;
    var maxEventId = -1;
    var profilesIndex = 0;
    var maxProfilesId = -1;

    while (eventsToSend.length < numEvents) {
      var event;
      var noProfiles = profilesIndex >= this._unsentProfiles.length;
      var noEvents = eventIndex >= this._unsentEvents.length;

      if (noEvents && noProfiles) {
        Utils.log.error('Problem merging event queues, fewer events than expected');
        break;
      }

      else if (noProfiles) {
        event = this._unsentEvents[eventIndex++];
        maxEventId = event._seq;

      } else if (noEvents) {
        event = this._unsentProfiles[profilesIndex++];
        maxProfilesId = event._seq;

      } else {
        if (this._unsentEvents[eventIndex]._seq <
            this._unsentProfiles[profilesIndex]._seq) {
          event = this._unsentEvents[eventIndex++];
          maxEventId = event._seq;
        } else {
          event = this._unsentProfiles[profilesIndex++];
          maxProfilesId = event._seq;
        }
      }
      eventsToSend.push(event);
    }

    return {
      eventsToSend: eventsToSend,
      maxEventId: maxEventId,
      maxProfilesId: maxProfilesId
    };
  }
  _updateARP(response={}) {
    const arp = response.arp;
    if (!arp) {
      return;
    }
    const ARPKey = _getARPKey();

    try {
      var arpFromStorage = StorageManager.read(ARPKey) || {};
      for (var key in arp) {
        if (arp.hasOwnProperty(key)) {
          if (arp[key] === -1) {
            delete arpFromStorage[key];
          } else {
            arpFromStorage[key] = arp[key];
          }
        }
      }
      StorageManager.save(ARPKey, arpFromStorage);
    } catch (e) {
      Utils.log.error("Unable to parse ARP JSON: " + e);
    }
  }
  _addARPToRequest(url) {
    const ARPKey = _getARPKey();
    if (!ARPKey) {
      return url;
    }
    var arp = StorageManager.read(ARPKey);
    if (arp) {
      return this._addToURL(url, 'arp', Helpers.compressData(JSON.stringify(arp)));
    }
    return url;
  }
  _addToURL(url, k, v) {
    return url + "&" + k + "=" + encodeURIComponent(v);
  }
}
