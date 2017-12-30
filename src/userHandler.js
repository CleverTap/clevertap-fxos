export default class UserHandler {
  constructor(api) {
    this.api = api;
  }
  getTotalVisits() {
    return this.api.getTotalVisits();
  }
  getLastVisit() {
    return this.api.getLastVisit();
  }
}
