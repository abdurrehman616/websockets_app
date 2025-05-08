const rateLimit = require('express-rate-limit');

// Create a rate limiter for the User API
const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  headers: true,
});

// Create a rate limiter for the Admin API (different settings)
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for admin routes
  message: 'Too many requests from this IP, please try again after 15 minutes',
  headers: true,
});

module.exports = { userRateLimiter, adminRateLimiter };
