import { Page, Locator } from '@playwright/test'

/**
 * Panel powiadomien uzytkownika ("dzwonek").
 *
 * Otwieramy go pod adresem /inbox, a nie przy konkretnej liscie.
 * To wlasna skrzynka zalogowanego uzytkownika, wiec widok nie zalezy
 * od tego, czy dana osoba ma prawo edytowac liste. Dzieki temu czerwony
 * wynik testu zawsze oznacza brak powiadomienia, a nie brak uprawnien.
 *
 * WAZNE: panel nie odswieza sie sam - zeby zobaczyc nowe powiadomienie,
 * trzeba wejsc na strone na nowo.
 */
export class NotificationsPanel {
  constructor(readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/inbox')
  }

  /** Kontener z trescia panelu. */
  get body(): Locator {
    return this.page.locator('.notifications-body')
  }

  /**
   * Wpis zawierajacy podany tekst. Szukamy po unikalnym znaczniku z tresci
   * komentarza, nie po nazwie produktu - nazwa produktu wystepuje takze
   * w starszych wpisach i dalaby falszywie pozytywny wynik.
   */
  entryContaining(text: string): Locator {
    return this.body.getByText(text)
  }
}
