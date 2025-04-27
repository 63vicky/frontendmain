const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100 to 200 requests per windowMs
  message: {message: 'Too many requests from this IP, please try again later'},
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 5 requests per windowMs
  message: {message: 'Too many login attempts, please try again after an hour'},
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient limiter for exam-related routes
const examLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {message: 'Too many exam requests, please try again in a minute'},
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for exam creation
const examCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 exam creations per hour
  message: {message: 'Too many exam creation attempts, please try again later'},
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  examLimiter,
  examCreationLimiter
}; 