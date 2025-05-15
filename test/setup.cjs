const dotenv = require('dotenv');

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Add any global test setup here
beforeAll(async () => {
  // Setup code that runs before all tests
  await mongoose.connect(process.env['MONGO_URI']);
});

afterAll(async () => {
  // Cleanup code that runs after all tests
  await mongoose.disconnect();
}); 