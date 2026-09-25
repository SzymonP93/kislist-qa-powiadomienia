import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  testDir: '.',

  // Jeden worker, bo testy dzialaja na wspoldzielonym koncie SaaS
  // i na tej samej liscie. Rownolegle wykonanie psuloby wzajemnie stan.
  workers: 1,
  fullyParallel: false,

  // Zero powtorzen. Ten test odtwarza zgloszony blad, wiec ma swiecic
  // na czerwono jednoznacznie. Przy wlaczonych retry Playwright pokazalby
  // go jako "flaky", co sugerowaloby problem z testem, a nie z aplikacja.
  retries: 0,

  timeout: 90_000,
  expect: { timeout: 15_000 },

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://kislist.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  },

  // Logowanie ma osobny plik konfiguracji (playwright.auth.config.ts),
  // bo wymaga czlowieka do wpisania kodu z maila. Dzieki temu samo
  // "npx playwright test" uruchamia tylko test i nie czeka na kod.
  projects: [
    {
      name: 'powiadomienia',
      testMatch: /tests\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
