// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production error response
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown errors
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

// Handle specific error types
const handleSpecificErrors = (err) => {
  if (err.name === 'ValidationError') {
    return new AppError(
      Object.values(err.errors).map(e => e.message).join(', '),
      400
    );
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return new AppError(
      `Duplicate field value: ${field}. Please use another value.`,
      409
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Your token has expired. Please log in again.', 401);
  }

  return err;
};

// Async error handler wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  handleSpecificErrors,
  catchAsync
}; 