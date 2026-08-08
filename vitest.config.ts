import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';

export default defineConfig(() => ({
  plugins: [angular()],
  resolve: {
    mainFields: ['module'],
    alias: {
      '@fuse': resolve(process.cwd(), 'src/@fuse'),
      'app': resolve(process.cwd(), 'src/app'),
      'environments': resolve(process.cwd(), 'src/environments'),
    },
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    pool: 'forks',
  },
}));
