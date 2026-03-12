/**
 * MongoDB connection configuration
 * Best practice: Centralized DB config for reuse and env-based connection
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Security: Prevent deprecated options; use strict query
      maxPoolSize: 10,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Security: Mongoose sanitization helps prevent NoSQL injection
mongoose.set('strictQuery', true);

module.exports = connectDB;
