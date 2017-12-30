export default class SessionHandler {
  constructor(api) {
    this.api = api;
  }
  getTimeElapsed() {
    return this.api.getTimeElapsed();
  }
  getPageCount() {
    return this.api.getPageCount();
  }
}
