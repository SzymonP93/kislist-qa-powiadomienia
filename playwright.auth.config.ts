import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

// Konfiguracja tylko do jednorazowego logowania kont (npm run auth).
// Okno przegladarki musi byc widoczne, bo kod z maila wpisuje czlowiek.
export default defineConfig({
  testDir: './setup',
  // Jedno okno naraz - inaczej otwarlyby sie dwie przegladarki jednoczesnie
  // i nie wiadomo byloby, ktory kod z maila wpisac gdzie.
  workers: 1,
  fullyParallel: false,
  testMatch: /auth\.setup\.ts/,
  timeout: 600_000,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://kislist.com',
    headless: false,
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  },
})
