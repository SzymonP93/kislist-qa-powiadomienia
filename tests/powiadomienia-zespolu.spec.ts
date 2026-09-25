import { test, expect } from '@playwright/test'
import { SharedListPage } from '../pages/SharedListPage'
import { NotificationsPanel } from '../pages/NotificationsPanel'

const SHARED_LIST_URL = process.env.SHARED_LIST_URL ?? ''
const PRODUCT_A = process.env.PRODUCT_A ?? ''

const OWNER_STATE = '.auth/owner.json'
const MEMBER_STATE = '.auth/member.json'

test.beforeAll(() => {
  if (!SHARED_LIST_URL || !PRODUCT_A) {
    throw new Error('Uzupelnij w pliku .env: SHARED_LIST_URL, PRODUCT_A')
  }
})

/**
 * WYMAGANIE Z ZADANIA:
 * "gdy klient komentuje udostepniona liste, powiadomienie powinni otrzymac
 *  wszyscy czlonkowie zespolu powiazani z lista"
 *
 * Ten test odtwarza zgloszony blad: powiadomienie dostaje WYLACZNIE
 * wlasciciel konta. Pozostali czlonkowie zespolu nie dostaja nic,
 * mimo ze maja dostep do tej samej listy i widza przy produktach komentarze.
 *
 * Test CELOWO NIE PRZECHODZI na obecnej wersji aplikacji.
 * Po naprawie ma przejsc bez zadnej zmiany w kodzie testu.
 */
test('klient komentuje udostepniona liste - powiadomienie dostaja wszyscy czlonkowie zespolu', async ({ browser }) => {
  // Trzy niezalezne sesje: anonimowy klient, zalogowany wlasciciel listy,
  // zalogowany czlonek zespolu powiazany z ta sama lista.
  const clientContext = await browser.newContext()
  const ownerContext = await browser.newContext({ storageState: OWNER_STATE })
  const memberContext = await browser.newContext({ storageState: MEMBER_STATE })

  const sharedList = new SharedListPage(await clientContext.newPage())
  const ownerInbox = new NotificationsPanel(await ownerContext.newPage())
  const memberInbox = new NotificationsPanel(await memberContext.newPage())

  // Unikalny znacznik na POCZATKU tresci komentarza. Po nim rozpoznajemy
  // w panelu powiadomienie o tym konkretnym komentarzu - sama nazwa produktu
  // nie wystarczy, bo w panelu sa wpisy z wczesniejszych uruchomien.
  const marker = `Z-${Date.now()}`

  await test.step('klient otwiera udostepniona liste bez logowania', async () => {
    await sharedList.open(SHARED_LIST_URL)
    await expect(sharedList.product(PRODUCT_A)).toBeVisible()
  })

  await test.step('klient dodaje komentarz do produktu', async () => {
    await sharedList.addComment(PRODUCT_A, `${marker} uwaga klienta do produktu`)
  })

  await test.step('wlasciciel listy dostaje powiadomienie', async () => {
    // Powiadomienie powstaje kilka sekund po komentarzu, a panel nie odswieza
    // sie sam - dlatego otwieramy go ponownie, az wpis sie pojawi (max 60 s).
    await expect(async () => {
      await ownerInbox.open()
      await expect(ownerInbox.entryContaining(marker)).toBeVisible({ timeout: 5_000 })
    }, 'wlasciciel nie dostal powiadomienia o komentarzu klienta').toPass({ timeout: 60_000 })
  })

  await test.step('czlonek zespolu powiazany z lista rowniez dostaje powiadomienie', async () => {
    // Sprawdzamy DOPIERO po tym, jak powiadomienie dotarlo do wlasciciela.
    // Zdarzenie zostalo wiec juz przetworzone i czerwony wynik ponizej
    // nie moze byc tlumaczony opoznieniem.
    await memberInbox.open()

    // Zanim sprawdzimy brak powiadomienia, upewniamy sie, ze czlonek zespolu
    // jest faktycznie zalogowany i stoi na swojej skrzynce. Bez tego wygasla
    // sesja przekierowalaby na logowanie, a test padlby na asercji ponizej
    // z komunikatem o braku powiadomienia - czyli z mylacego powodu.
    await expect(
      memberInbox.page,
      'sesja czlonka zespolu wygasla - uruchom ponownie npm run auth',
    ).toHaveURL(/\/inbox/)

    // TA ASERCJA ODTWARZA ZGLOSZONY BLAD I OBECNIE NIE PRZECHODZI.
    await expect(
      memberInbox.entryContaining(marker),
      'czlonek zespolu nie dostal powiadomienia o komentarzu klienta, mimo ze ma dostep do tej samej listy',
    ).toBeVisible()
  })
})
