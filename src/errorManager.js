import ErrorMessages from './errorMessages';

let _errors = [];

class ErrorManager {
  static pushError(code, message) {
    _errors.push({
      c: code,
      d: message
    });
  }
  static popError() {
    return _errors.shift();
  }
}

ErrorManager.MESSAGES = ErrorMessages;
export default ErrorManager;
