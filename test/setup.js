import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { server } from '../app.js';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Add any global test setup here
beforeAll(async () => {
  // Setup code that runs before all tests
  // await mongoose.connect(process.env['MONGO_URI']);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

afterAll(async () => {
  // Close server if it's still running
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  // Cleanup code that runs after all tests
  await mongoose.disconnect();
}); 