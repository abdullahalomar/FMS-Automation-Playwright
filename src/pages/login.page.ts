import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { testConfig } from '../../config/testConfig';

/**
 * LoginPage class representing the Sign-In page interactions and locators.
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByPlaceholder('Email or Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: /LOG IN/i });
    this.forgotPasswordButton = page.getByRole('button', { name: /FORGOT PASSWORD/i });
  }

  /**
   * Navigate directly to the Sign-In page
   */
  async navigate(): Promise<void> {
    await this.navigateTo(testConfig.loginUrl);
    await this.verifyLoginPageLoaded();
  }

  /**
   * Verify that the Login Page elements are properly loaded
   */
  async verifyLoginPageLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveTitle(/Sign In|FMS/i);
  }

  /**
   * Fill user email
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill user password
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Full login workflow helper
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }
}
