export default {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js"
  ],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>/tests"],

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json"],

  // Setup files after environment is loaded
  setupFilesAfterEnv: ["<rootDir>/test-setup.js"],

  // Transform files to support ES modules
  transform: {},

  // Enable ES modules
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}; 