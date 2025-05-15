import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default {
  Memory: true,
  db: {
    uri: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test',
    options: {
      serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT || '1000'),
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
    }
  },
  
  // Test environment
  env: process.env.NODE_ENV || 'test',
};