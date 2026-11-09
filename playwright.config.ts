import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:4322', channel: 'chrome' },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npm run dev -- --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
  },
});
