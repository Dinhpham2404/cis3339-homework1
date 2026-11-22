// Small helpers shared by the routes.

// An error with an HTTP status code. Throw it inside a route and the
// error handler in app.js turns it into a JSON response.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Makes user text safe to use inside a regular expression.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Reads a text value from the request body and trims it.
// Numbers are accepted too (e.g. studentId sent as 1001).
function text(value) {
  if (typeof value === 'number') return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

module.exports = { HttpError, escapeRegex, text };
