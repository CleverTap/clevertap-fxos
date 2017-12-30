var _userLoginQueue = [];

export default class UserLoginHandler {
  constructor(api, cachedQueue) {
    this.api = api;

    _userLoginQueue.push = function (argsArray) {
      this.api.onUserLogin(argsArray);
    }.bind(this);

    if (cachedQueue && cachedQueue.length > 0) {
      for(var index = 0; index < cachedQueue.length; index++) {
        this.push(cachedQueue[index]);
      }
    }
  }
  push() {
    //since arguments is not an array, convert it into an array
    _userLoginQueue.push(Array.prototype.slice.call(arguments));
    return true;
  }
}
