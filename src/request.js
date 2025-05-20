import Constants from './constants';
import Utils from './utils';

export default class Request {
  constructor(url, data) {
    this.url = url;
    this.data = data || [];
  }
  send(callback) {
    function _onRequestError() {
      if (callback) {
        callback(request.status, request.error);
      }
    }

    function _onRequestLoad() {
      var redirectHeader = request.getResponseHeader(Constants.RESPONSE_HEADER_REDIRECT_KEY);
      var headers = {};
      headers[Constants.RESPONSE_HEADER_REDIRECT_KEY] = redirectHeader;

      if (callback) {
        callback(request.status, request.response, headers);
      }
    }

    var request = new XMLHttpRequest({ mozSystem: true });
    request.open('post', this.url, true);
    request.responseType = 'json';
    request.addEventListener('error', _onRequestError);
    request.addEventListener('load', _onRequestLoad);
    request.setRequestHeader("Accept","application/json");
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify(this.data));
    
    Utils.log.debug("req snt -> url: " + this.url);
  }
}
