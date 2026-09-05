import { defineConfig, devices } from '@playwright/test'

/**
 * The browser half of the test suite.
 *
 * Everything here needs a real rendering engine: colour contrast, which jsdom
 * cannot compute because it has no layout; the page-level axe rules, which need
 * a whole document; and the interaction chains Radix drives through real focus
 * events, which jsdom does not complete.
 *
 * Port 4024 rather than the dev server's 4023, so a suite run never collides
 * with a dev server someone left open.
 */
const PORT = Number(process.env.PORT ?? 4024)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Serves the built export, not the dev server — see scripts/serve-out.mjs.
    command: `node scripts/serve-out.mjs`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: String(PORT) },
  },
})
