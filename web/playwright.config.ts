import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5190/STICKY_WALL_WORLD/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    contextOptions: { reducedMotion: 'reduce' },
    actionTimeout: 10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } } },
    { name: 'mobile-chromium', testMatch: /responsive\.spec\.ts/, use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 }, launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } } },
  ],
  webServer: {
    command: 'npm run build:pages && npm run preview -- --host 127.0.0.1 --port 5190 --strictPort --base=/STICKY_WALL_WORLD/',
    url: 'http://127.0.0.1:5190/STICKY_WALL_WORLD/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
