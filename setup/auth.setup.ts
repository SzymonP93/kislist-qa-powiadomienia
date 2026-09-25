import { test as setup, Page } from '@playwright/test'

/**
 * Logowanie kont i zapis sesji do plikow.
 *
 * DLACZEGO TRYB HEADED I RECZNY KROK:
 * KIS List przy logowaniu z nowej przegladarki wysyla czterocyfrowy kod
 * na adres e-mail. Playwright nie ma dostepu do skrzynki, wiec tego kroku
 * nie da sie zautomatyzowac bez integracji z poczta. Setup wypelnia login
 * i haslo, po czym czeka, az kod zostanie wpisany recznie.
 *
 * Uruchomienie: npm run auth
 * Robi sie to RAZ. Zapisane sesje wystarczaja do uruchamiania testow.
 *
 * Logujemy DWA konta, bo scenariusz porownuje, co widzi wlasciciel listy,
 * a co widzi zwykly czlonek zespolu powiazany z ta sama lista.
 */

async function signIn(page: Page, email: string, password: string, statePath: string, label: string) {
  await page.goto('/logowanie')
  await page.getByPlaceholder('Wpisz adres e-mail').fill(email)
  await page.getByPlaceholder('Twoje hasło').fill(password)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  console.log(`\n>>> [${label}] Jesli pojawil sie ekran z kodem, wpisz kod z maila i kliknij "Zaloguj". Czekam do 8 minut.\n`)
  await page.waitForURL(/\/(lists|dashboard)/, { timeout: 480_000 })

  await page.context().storageState({ path: statePath })
  console.log(`\n>>> [${label}] Sesja zapisana do ${statePath}\n`)
}

setup('zaloguj wlasciciela listy', async ({ page }) => {
  const email = process.env.OWNER_EMAIL
  const password = process.env.OWNER_PASSWORD
  if (!email || !password) throw new Error('Brak OWNER_EMAIL lub OWNER_PASSWORD w pliku .env')
  await signIn(page, email, password, '.auth/owner.json', 'WLASCICIEL')
})

setup('zaloguj czlonka zespolu', async ({ page }) => {
  const email = process.env.MEMBER_EMAIL
  const password = process.env.MEMBER_PASSWORD
  if (!email || !password) throw new Error('Brak MEMBER_EMAIL lub MEMBER_PASSWORD w pliku .env')
  await signIn(page, email, password, '.auth/member.json', 'CZLONEK ZESPOLU')
})
