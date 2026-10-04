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
  readonly myCoursesMenu: Locator;
  readonly examsTab: Locator;
  readonly availableExamsHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.systemMenu = page.getByText('SYSTEM').first();
    this.learnMenu = page.getByText('LEARN').first();
    this.specializationsMenu = page.getByText('SPECIALIZATIONS').first();
    this.membershipMenu = page.getByText('MEMBERSHIP').first();
    this.proToolsMenu = page.getByText('PRO TOOLS').first();
    this.myCoursesMenu = page.getByRole('button', { name: /My Courses/i }).first();
    this.examsTab = page.getByRole('button', { name: /^Exams$/i }).first();
    this.availableExamsHeader = page.getByText(/Available Exams/i).first();
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

  /**
   * Navigate to My Courses section
   */
  async navigateToMyCourses(): Promise<void> {
    await expect(this.myCoursesMenu).toBeVisible();
    await this.myCoursesMenu.click();
    await this.waitForUrl(/my-courses/i);
  }

  /**
   * Navigate to Exams tab under My Courses
   */
  async navigateToExams(): Promise<void> {
    await expect(this.examsTab).toBeVisible();
    await this.examsTab.click();
    await this.waitForUrl(/my-courses\?tab=exams/i);
  }

  /**
   * Verify Exams section is loaded successfully
   */
  async verifyExamsPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/tab=exams/);
    await expect(this.availableExamsHeader).toBeVisible();
  }
}
