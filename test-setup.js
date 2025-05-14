import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Add any global test setup here
beforeAll(() => {
  // Setup code that runs before all tests
});

afterAll(() => {
  // Cleanup code that runs after all tests
}); 