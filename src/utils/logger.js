// src/utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Create the log rotation transport
const dailyRotateFileTransport = new DailyRotateFile({
  filename: 'logs/%DATE%-server.log',  // Save logs in the 'logs' directory with daily rotation
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // Optional: Zip old logs to save space
  maxSize: '20m', // Maximum size of each log file (20 MB)
  maxFiles: '14d' // Retain logs for 14 days
});

// Create the logger
const logger = winston.createLogger({
  level: 'info', // Default log level (can be changed based on environment)
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),  // Log to console
    dailyRotateFileTransport // Log to file with rotation
  ]
});

module.exports = logger;
