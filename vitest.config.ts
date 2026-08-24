import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';

export default defineConfig(() => ({
  plugins: [angular()],
  resolve: {
    mainFields: ['module'],
    alias: {
      'app': resolve(process.cwd(), 'src/app'),
      'environments': resolve(process.cwd(), 'src/environments'),
      'config': resolve(process.cwd(), 'src/config.ts'),
    },
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      all: false,
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'dist/coverage',
      include: ['src/app/**/*.ts'],
      exclude: [
        'src/app/@fuse/**',
        'src/**/*.spec.ts',
        'src/test-setup.ts',
        'src/main.ts',
      ],
      thresholds: {
        statements: 8,
        branches: 3,
        functions: 10,
        lines: 8,
      },
    },
  },
}));
