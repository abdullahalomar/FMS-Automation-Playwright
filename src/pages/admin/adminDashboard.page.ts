import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { testConfig } from '../../../config/testConfig';

/**
 * AdminDashboardPage class representing the Admin Dashboard after successful authentication.
 */
export class AdminDashboardPage extends BasePage {
  // Locators
  readonly dashboardHeading: Locator;
  readonly eventsSidebarMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' }).first();
    this.eventsSidebarMenu = page.locator('a[href*="/admin/events"]').first();
  }

  /**
   * Verify Admin Dashboard page is loaded successfully
   */
  async verifyAdminDashboardLoaded(): Promise<void> {
    await this.waitForUrl(new RegExp(testConfig.admin.dashboardUrl));
    await expect(this.page).toHaveTitle(/Dashboard - FMS Admin Staging/i);
    await expect(this.dashboardHeading).toBeVisible();
  }

  /**
   * Navigate to Events section via Sidebar Menu
   */
  async navigateToEventsMenu(): Promise<void> {
    await expect(this.eventsSidebarMenu).toBeVisible();
    await this.eventsSidebarMenu.scrollIntoViewIfNeeded();
    await this.eventsSidebarMenu.click();
  }
}
