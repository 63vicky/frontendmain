/**
 * Handle errors in a consistent way across the application
 * @param {Object} res - Express response object
 * @param {Error} error - The error object
 * @param {String} defaultMessage - Default error message if none is provided
 */
exports.handleError = (res, error, defaultMessage = 'An error occurred') => {
  console.error(error);

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Handle cast errors (invalid IDs)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // Handle multer errors
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: error.message || defaultMessage
  });
}; 