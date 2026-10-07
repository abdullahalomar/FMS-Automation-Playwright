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
    this.systemMenu = page.getByText(/SYSTEM/i).first();
    this.learnMenu = page.getByText(/LEARN/i).first();
    this.specializationsMenu = page.getByText(/SPECIALIZATIONS/i).first();
    this.membershipMenu = page.getByRole('link', { name: /Membership/i }).or(page.getByRole('button', { name: /Membership/i })).or(page.getByText(/Membership/i)).first();
    this.proToolsMenu = page.getByText(/PRO TOOLS/i).first();
    this.myCoursesMenu = page.locator('[data-tour="user-profile-my-courses"]').or(page.getByRole('button', { name: /My Courses/i })).or(page.getByRole('link', { name: /My Courses/i })).first();
    this.examsTab = page.getByRole('button', { name: /Exams/i }).or(page.getByRole('tab', { name: /Exams/i })).or(page.getByText(/Exams/i)).first();
    this.availableExamsHeader = page.getByText(/Available Exams/i).first();
  }

  /**
   * Verify dashboard page is loaded successfully
   */
  async verifyDashboardLoaded(): Promise<void> {
    await this.waitForUrl(/dashboard/i);
    await expect(this.page).toHaveURL(testConfig.dashboardUrl);
    await expect(this.myCoursesMenu).toBeVisible();
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
  /**
   * Click "Take Test" or "Continue" button for a specific course by Course ID, Name, or Index.
   * @param courseIdentifier Course Name (e.g. "Squat Pattern", "Functional Movement Screen"), Course ID (e.g. "364549"), or Index ("1").
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

    // Wait for API content/buttons to finish loading under Available Exams tab
    await this.page.locator(testBtnSelector).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1000);

    // Filter by search box if present
    const searchInput = this.page.getByPlaceholder(/Search/i).or(this.page.getByRole('textbox', { name: /Search/i })).first();
    const isSearchVisible = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (isSearchVisible && isNaN(parseInt(courseIdentifier, 10))) {
      await searchInput.fill(courseIdentifier).catch(() => {});
      await this.page.waitForTimeout(1000);
    }

    let targetButton: Locator | null = null;

    // Strategy 1: Title node to discrete card container & action button matching
    const matchedIndex = await this.page.evaluate(({ search }) => {
      const cleanSearch = search.trim().toLowerCase();

      // Find all elements whose text matches cleanSearch and length < 250 (specific course title element)
      const allElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, td, th'));
      const matchingTitleNodes = allElements.filter(el => {
        const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        return txt.includes(cleanSearch) && txt.length < 250;
      });

      if (matchingTitleNodes.length > 0) {
        // Sort by text length ascending to get the most specific title node
        matchingTitleNodes.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
        const titleNode = matchingTitleNodes[0];

        // Traverse parent chain to find the smallest parent container holding an action button
        let parent: HTMLElement | null = titleNode as HTMLElement;
        let depth = 0;
        while (parent && parent !== document.body && depth < 10) {
          const actionBtn = parent.querySelector('button, a');
          if (actionBtn) {
            const btnText = (actionBtn.textContent || '').trim().toLowerCase();
            if (btnText.includes('take') || btnText.includes('continue') || btnText.includes('start') || btnText.includes('resume')) {
              // Get index of this actionBtn among all action buttons on the page
              const allActionBtns = Array.from(document.querySelectorAll('button, a')).filter(b => {
                const t = (b.textContent || '').trim().toLowerCase();
                return t.includes('take') || t.includes('continue') || t.includes('start') || t.includes('resume');
              });
              const idx = allActionBtns.indexOf(actionBtn as HTMLElement);
              if (idx !== -1) return idx;
            }
          }
          parent = parent.parentElement;
          depth++;
        }
      }
      return -1;
    }, { search: courseIdentifier }).catch(() => -1);

    if (matchedIndex >= 0) {
      const allBtns = this.page.locator(testBtnSelector);
      const btn = allBtns.nth(matchedIndex);
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        targetButton = btn;
        console.log(`Matched specific action button #${matchedIndex + 1} for course: "${courseIdentifier}"`);
      }
    }

    // Strategy 2: Direct link/href or attribute containing course ID or Name
    if (!targetButton || !(await targetButton.isVisible().catch(() => false))) {
      const hrefLink = this.page.locator(`a[href*="${courseIdentifier}"], button[data-course-id*="${courseIdentifier}"]`).first();
      if (await hrefLink.isVisible({ timeout: 1000 }).catch(() => false)) {
        targetButton = hrefLink;
      }
    }

    // Strategy 3: Numeric index fallback if numeric index passed (e.g. "1", "2")
    const numericIndex = parseInt(courseIdentifier, 10);
    if ((!targetButton || !(await targetButton.isVisible().catch(() => false))) && !isNaN(numericIndex) && numericIndex > 0 && numericIndex <= 20) {
      const indexedBtn = this.page.locator(testBtnSelector).nth(numericIndex - 1);
      if (await indexedBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        targetButton = indexedBtn;
      }
    }

    // Validation: fail if exact course button was not found
    if (!targetButton || !(await targetButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      throw new Error(`Course exam "${courseIdentifier}" was NOT found under Available Exams for this user! Please check course name or user account.`);
    }

    await expect(targetButton).toBeVisible({ timeout: 10000 });
    const buttonText = await targetButton.innerText().catch(() => 'Take Test/Continue');
    const cleanButtonText = buttonText.trim().replace(/\s+/g, ' ');
    console.log(`Clicking "${cleanButtonText}" button for course: "${courseIdentifier}"`);
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
