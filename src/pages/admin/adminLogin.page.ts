import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { testConfig } from '../../../config/testConfig';

/**
 * AdminLoginPage class representing the Admin Sign-In page interactions and locators.
 */
export class AdminLoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.signInButton = page.getByRole('button', { name: /Sign in/i });
  }

  /**
   * Navigate directly to the Admin Login page
   */
  async navigate(): Promise<void> {
    await this.navigateTo(testConfig.admin.loginUrl);
    await this.verifyAdminLoginPageLoaded();
  }

  /**
   * Verify that the Admin Login Page elements are properly loaded
   */
  async verifyAdminLoginPageLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.page).toHaveTitle(/Login - FMS Admin Staging/i);
  }

  /**
   * Fill Admin Email
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill Admin Password
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click Sign in button
   */
  async clickSignInButton(): Promise<void> {
    await this.signInButton.click();
  }

  /**
   * Complete Admin Login workflow helper
   */
  async login(email: string = testConfig.admin.credentials.email, password: string = testConfig.admin.credentials.password): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignInButton();
  }
}
