// Used to report form validation errors with an optional field reference
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name  = 'ValidationError';
    this.field = field;
  }
}