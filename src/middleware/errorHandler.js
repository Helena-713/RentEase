const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const errorHandlers = [
  {
    match: (err) => err instanceof ValidationError,
    handle: (err) => ({
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    }),
  },
  {
    match: (err) => err instanceof UniqueConstraintError,
    handle: (err) => ({
      statusCode: 409,
      message: 'Resource already exists',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    }),
  },
  {
    match: (err) => err instanceof ForeignKeyConstraintError,
    handle: () => ({
      statusCode: 400,
      message: 'Invalid reference',
    }),
  },
  {
    match: (err) => err instanceof AppError && err.errors?.length,
    handle: (err) => ({ errors: err.errors }),
  },
];

const sendErrorResponse = (res, err, { statusCode, message, errors }) => {
  const response = {
    success: false,
    message,
    errors,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

const errorHandler = (err, req, res, next) => {
  const log = req.log || logger;
  log.error({ err }, err.message);

  const handler = errorHandlers.find((h) => h.match(err));
  if (handler) {
    const result = handler.handle(err);
    return sendErrorResponse(res, err, {
      statusCode: result.statusCode ?? err.statusCode ?? 500,
      message: result.message ?? err.message ?? 'Internal server error',
      errors: result.errors ?? [],
    });
  }

  if (!(err instanceof AppError)) {
    return sendErrorResponse(res, err, {
      statusCode: 500,
      message: 'Internal server error',
      errors: [],
    });
  }

  return sendErrorResponse(res, err, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    errors: [],
  });
};

module.exports = errorHandler;
