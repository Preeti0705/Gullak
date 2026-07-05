const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Enhanced with connection pooling and retry logic for scalability.
 * Pool size tuned for concurrent access under Docker deployment.
 */
const connectDB = async (retries = 5) => {
  const options = {
    // Connection pool settings for scalability
    maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    // Timeouts
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    // Write concern
    w: 'majority',
    retryWrites: true,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (pool: ${options.maxPoolSize})`);

      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB runtime error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Mongoose will auto-reconnect.');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('❌ All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
