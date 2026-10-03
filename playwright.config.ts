import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for FMS Automation Framework
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000, // 60 seconds test timeout
  expect: {
    timeout: 15000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://staging.functionalmovement.site',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 }, // Default Full HD Viewport for all tests
  },

  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          args: ['--start-maximized'], // Maximize browser window in headed mode
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
