module.exports = {
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

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json"],

  // NOTE: Currently using CJS for globalSetup, globalTeardown, and setupFilesAfterEnv since Jest support for ESM is still experimental
  globalSetup: "<rootDir>/test/globalSetup.cjs",
  globalTeardown: "<rootDir>/test/globalTeardown.cjs",
  setupFilesAfterEnv: ["<rootDir>/test/setup.cjs"],

  // extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    // '^(\\.{1,2}/.*)\\.js$': '$1'
  },
}; 