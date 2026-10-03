import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { testConfig } from '../../config/testConfig';

/**
 * DashboardPage class representing the User Dashboard after successful authentication.
 */
export class DashboardPage extends BasePage {
  // Locators
  readonly systemMenu: Locator;
  readonly learnMenu: Locator;
  readonly specializationsMenu: Locator;
  readonly membershipMenu: Locator;
  readonly proToolsMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.systemMenu = page.getByText('SYSTEM').first();
    this.learnMenu = page.getByText('LEARN').first();
    this.specializationsMenu = page.getByText('SPECIALIZATIONS').first();
    this.membershipMenu = page.getByText('MEMBERSHIP').first();
    this.proToolsMenu = page.getByText('PRO TOOLS').first();
  }

  /**
   * Verify dashboard page is loaded successfully
   */
  async verifyDashboardLoaded(): Promise<void> {
    await this.waitForUrl(/dashboard/i);
    await expect(this.page).toHaveTitle(/Dashboard | FMS/i);
    await expect(this.page).toHaveURL(testConfig.dashboardUrl);
    await expect(this.membershipMenu).toBeVisible();
  }
}
