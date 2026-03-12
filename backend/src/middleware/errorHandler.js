/**
 * Centralized error handler - Best practice: single place for error responses
 * Security: Do not leak stack traces or internal details in production
 */
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Security: In production, avoid exposing internal errors
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong'
      : message,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
