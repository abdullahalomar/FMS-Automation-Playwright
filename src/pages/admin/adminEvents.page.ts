import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * AdminEventsPage class representing the Admin Events section.
 */
export class AdminEventsPage extends BasePage {
  // Locators
  readonly eventsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.eventsHeading = page.getByRole('heading', { name: 'Events' }).first();
  }

  /**
   * Verify Admin Events page is loaded successfully
   */
  async verifyAdminEventsPageLoaded(): Promise<void> {
    await this.waitForUrl(/admin\/events/i);
    await expect(this.eventsHeading).toBeVisible();
  }
}
