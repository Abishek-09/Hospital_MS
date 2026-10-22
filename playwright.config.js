import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for Santosh Child Care Hospital Management System
 * Configured to run against http://localhost:5173
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false, // Run suites sequentially for clean localStorage isolation
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'Mobile Safari / Chrome',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
      testMatch: /suite4-responsive\.spec\.js/
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60000
  }
});
