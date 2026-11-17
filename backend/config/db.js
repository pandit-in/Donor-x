const mongoose = require('mongoose');

let connectionPromise;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(true);
  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MongoDB connection warning: MONGO_URI is not configured.');
    return Promise.resolve(false);
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || 'donorx',
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    maxPoolSize: 10,
  })
    .then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return true;
    })
    .catch((error) => {
      console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
      console.warn('The next API request will retry the database connection.');
      return false;
    })
    .finally(() => {
      connectionPromise = undefined;
    });

  return connectionPromise;
};

module.exports = connectDB;
