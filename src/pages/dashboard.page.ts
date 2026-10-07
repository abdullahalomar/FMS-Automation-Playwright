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

  /**
   * Click "Take Test" or "Continue" button for a specific course by Course ID, Name, or Index.
   * @param courseIdentifier Course Name (e.g. "Functional Wellness Exam"), Course ID (e.g. "364549"), or Index ("1").
   */
  async takeTestByCourse(courseIdentifier: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.hideChatWidget();

    // Ensure we are in the Exams section
    if (!this.page.url().includes('tab=exams')) {
      await this.navigateToExams();
    }

    const testBtnSelector = [
      'button:has-text("Take Test")',
      'button:has-text("Continue")',
      'button:has-text("Take Exam")',
      'button:has-text("Start Test")',
      'button:has-text("Start Exam")',
      'button:has-text("Continue Test")',
      'button:has-text("Resume")',
      'a:has-text("Take Test")',
      'a:has-text("Continue")',
      'a:has-text("Take Exam")',
      'a:has-text("Start Test")',
      'a:has-text("Start Exam")',
      'a:has-text("Continue Test")',
      'a:has-text("Resume")',
      'button:has-text("Take")',
      'a:has-text("Take")',
      'button:has-text("Start")',
      'a:has-text("Start")'
    ].join(', ');

    // Wait for at least one test/continue button to appear on the page (auto-wait for DOM/API render)
    const anyBtn = this.page.locator(testBtnSelector).first();
    await anyBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    let targetButton: Locator | null = null;
    const buttons = this.page.locator(testBtnSelector);

    // Strategy 1: Find the exact button index whose discrete parent card container text matches courseIdentifier (< 280 chars)
    const matchedIndex = await this.page.evaluate(({ search }) => {
      const cleanSearch = search.trim().toLowerCase();
      const btns = Array.from(document.querySelectorAll('button, a')).filter(b => {
        const txt = (b.textContent || '').trim().toLowerCase();
        return txt.includes('take') || txt.includes('continue') || txt.includes('start') || txt.includes('resume');
      });

      for (let i = 0; i < btns.length; i++) {
        let parent: HTMLElement | null = btns[i].parentElement;
        let depth = 0;
        while (parent && depth < 5) {
          const cardText = (parent.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
          // Stop climbing if parent container wraps multiple cards (> 280 chars)
          if (cardText.length > 280) break;

          if (cardText.includes(cleanSearch)) {
            return i;
          }
          parent = parent.parentElement;
          depth++;
        }
      }
      return -1;
    }, { search: courseIdentifier }).catch(() => -1);

    if (matchedIndex >= 0) {
      targetButton = buttons.nth(matchedIndex);
      console.log(`Matched discrete button #${matchedIndex + 1} for course: "${courseIdentifier}"`);
    }

    // Strategy 2: Search by direct link/href or attribute containing course ID or Name
    if (!targetButton || !(await targetButton.isVisible().catch(() => false))) {
      const hrefLink = this.page.locator(`a[href*="${courseIdentifier}"], button[data-course-id*="${courseIdentifier}"]`).first();
      if (await hrefLink.isVisible({ timeout: 1000 }).catch(() => false)) {
        targetButton = hrefLink;
      }
    }

    // Strategy 3: Handle numeric index fallback if index passed (e.g. "1")
    const numericIndex = parseInt(courseIdentifier, 10);
    if ((!targetButton || !(await targetButton.isVisible().catch(() => false))) && !isNaN(numericIndex) && numericIndex > 0 && numericIndex <= 20) {
      const indexedBtn = this.page.locator(testBtnSelector).nth(numericIndex - 1);
      if (await indexedBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        targetButton = indexedBtn;
      }
    }

    // Strict validation: fail if not matched
    if (!targetButton || !(await targetButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      throw new Error(`Course exam "${courseIdentifier}" was NOT found under Available Exams for this user! Please check course name or user account.`);
    }

    await expect(targetButton).toBeVisible({ timeout: 10000 });
    const buttonText = await targetButton.innerText().catch(() => 'Take Test/Continue');
    const cleanButtonText = buttonText.trim().replace(/\s+/g, ' ');
    console.log(`Clicking button "${cleanButtonText}" for course: "${courseIdentifier}"`);
    await targetButton.click();
  }

  /**
   * Alias method for takeTestByCourse using Course Name or ID.
   */
  async takeTestByCourseName(courseIdentifier: string): Promise<void> {
    await this.takeTestByCourse(courseIdentifier);
  }

  /**
   * Alias method for takeTestByCourse using Course ID or Name.
   */
  async takeTestByCourseId(courseIdentifier: string): Promise<void> {
    await this.takeTestByCourse(courseIdentifier);
  }
}
