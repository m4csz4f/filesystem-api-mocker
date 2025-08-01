import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.config.js',
        '**/*.config.ts',
        'test-mocks/**',
      ],
    },
    setupFiles: ['./tests/setup.js'],
    pool: 'forks',
  },
});
