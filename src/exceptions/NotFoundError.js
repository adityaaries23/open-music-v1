const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;
