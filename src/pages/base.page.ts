import { Page, expect } from '@playwright/test';

/**
 * BasePage class providing common reusable page actions and utility methods.
 * All Page Object Model classes inherit from BasePage.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific relative or absolute path
   */
  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for URL to match a specific string or pattern
   */
  async waitForUrl(urlOrRegExp: string | RegExp, timeout: number = 15000): Promise<void> {
    await this.page.waitForURL(urlOrRegExp, { timeout });
  }

  /**
   * Wait for page DOM network idle
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
