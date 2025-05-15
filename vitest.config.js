import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true, // optional: allows using test/expect/describe without imports
  },
});