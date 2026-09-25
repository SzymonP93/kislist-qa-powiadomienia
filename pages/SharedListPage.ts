import { Page, Locator, expect } from '@playwright/test'

/**
 * Widok klienta - udostepniona lista pod adresem /list-preview/<TOKEN>.
 * NIE wymaga logowania: klient wchodzi anonimowo przez publiczny link.
 */
export class SharedListPage {
  constructor(private readonly page: Page) {}

  async open(sharedUrl: string): Promise<void> {
    await this.page.goto(sharedUrl)
  }

  /**
   * Kafelek produktu. Uwaga: lista uzywa wirtualnego przewijania,
   * wiec w DOM istnieja tylko produkty aktualnie widoczne na ekranie.
   */
  product(name: string): Locator {
    return this.page.locator('.proposal-item', { hasText: name })
  }

  async addComment(productName: string, text: string): Promise<void> {
    const item = this.product(productName)
    await item.scrollIntoViewIfNeeded()

    // Pole tresci nie istnieje w DOM od razu - pojawia sie dopiero
    // po kliknieciu "Napisz komentarz". To edytor tekstu (contenteditable),
    // a napis "Wpisz treść wiadomości" siedzi w atrybucie data-placeholder
    // wewnetrznego akapitu i jest tylko dorysowywany przez CSS. Atrybutu
    // placeholder tam nie ma, wiec getByPlaceholder() nie ma czego znalezc -
    // dlatego szukamy pola po roli "textbox", podanej wprost w role="textbox".
    await item.getByRole('button', { name: 'Napisz komentarz' }).click()
    await item.getByRole('textbox').fill(text)
    await item.getByRole('button', { name: 'Wyślij', exact: true }).click()

    await expect(item.getByText(text)).toBeVisible()
  }
}
