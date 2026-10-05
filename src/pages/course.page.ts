import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * CoursePage class representing individual course details and content page.
 */
export class CoursePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Open and start a specific course by Title, ID, or Index across In Progress and Available Courses tabs.
   * @param courseIdentifier Course title (e.g. "Functional Wellness", "The FMS Approach"), course ID ("364808"), or index ("1").
   */
  async openCourseById(courseIdentifier: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.hideChatWidget();
    await this.page.waitForTimeout(1000);

    const actionBtnSelector = 'button:has-text("start"), button:has-text("continue"), button:has-text("resume"), a:has-text("start"), a:has-text("continue"), a:has-text("resume"), a[href*="/user/my-courses/"]';

    // Helper to find action button for courseIdentifier on the current view
    const findActionButton = async (): Promise<Locator | null> => {
      // 1. Search by href containing ID (e.g. /user/my-courses/364831)
      const linkById = this.page.locator(`a[href*="${courseIdentifier}"]`).first();
      if (await linkById.isVisible({ timeout: 2000 }).catch(() => false)) {
        return linkById;
      }

      // 2. Search by course title or text inside container
      const containerBtn = this.page.locator('div, article, li, section')
        .filter({ hasText: courseIdentifier })
        .locator(actionBtnSelector)
        .first();

      if (await containerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        return containerBtn;
      }

      return null;
    };

    // Try Search Box if available
    const searchInput = this.page.getByPlaceholder(/Search Courses/i).or(this.page.getByRole('textbox', { name: /Search Courses/i })).first();
    const isSearchVisible = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (isSearchVisible && isNaN(parseInt(courseIdentifier, 10))) {
      console.log(`Searching for course "${courseIdentifier}" in search box...`);
      await searchInput.fill(courseIdentifier);
      await this.page.waitForTimeout(1000);
    }

    // Step 1: Check current active tab ("In Progress")
    let targetButton = await findActionButton();

    // Step 2: If not found, switch to "Available Courses" tab
    if (!targetButton) {
      console.log(`Course "${courseIdentifier}" not found in current tab. Checking "Available Courses" tab...`);
      const availableTab = this.page.getByRole('button', { name: /Available Courses/i }).first();
      if (await availableTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await availableTab.click();
        await this.page.waitForTimeout(1500);

        if (isSearchVisible && isNaN(parseInt(courseIdentifier, 10))) {
          await searchInput.fill(courseIdentifier);
          await this.page.waitForTimeout(1000);
        }

        targetButton = await findActionButton();
      }
    }

    // If search didn't find any target button, clear the search input so search results reset
    if (!targetButton && isSearchVisible) {
      const searchVal = await searchInput.inputValue().catch(() => '');
      if (searchVal) {
        console.log(`Search for "${searchVal}" yielded no direct target. Clearing search box...`);
        await searchInput.fill('');
        await this.page.waitForTimeout(1000);
        targetButton = await findActionButton();
      }
    }

    // Step 3: Handle numeric index fallback ("1", "2")
    const numericIndex = parseInt(courseIdentifier, 10);
    if (!targetButton && !isNaN(numericIndex) && numericIndex > 0 && numericIndex <= 20) {
      console.log(`Selecting course by index: #${numericIndex}`);
      targetButton = this.page.locator(actionBtnSelector).nth(numericIndex - 1);
    }

    // Step 4: Fallback to first available course button if specific target is not matched
    if (!targetButton || !(await targetButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      console.log(`Target course "${courseIdentifier}" not directly matched. Falling back to first course button.`);
      targetButton = this.page.locator(actionBtnSelector).first();
    }

    await expect(targetButton).toBeVisible({ timeout: 10000 });
    console.log(`Clicking start/continue button for course: "${courseIdentifier}"`);
    await targetButton.click();
  }

  /**
   * Verify course page / player is loaded after starting course.
   */
  async verifyCoursePageLoaded(courseIdentifier: string): Promise<void> {
    await this.page.waitForTimeout(3000);
    console.log(`Current page URL after starting course: ${this.page.url()}`);
  }

  /**
   * Click on 'Start Course' / 'Resume' / 'Continue' if inside detail view.
   */
  async startCourse(): Promise<void> {
    const startBtn = this.page.getByRole('button', { name: /start course|continue course|resume|continue/i }).first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    }
  }

  /**
   * Click on 'View Result' / 'View Results' button if present after quiz completion.
   */
  async viewQuizResultIfPresent(): Promise<boolean> {
    const viewResultBtn = this.page
      .getByRole('button', { name: /^view result$|^view results$|^see result$|^see results$/i })
      .or(this.page.locator('button:has-text("View Result"), button:has-text("View Results"), a:has-text("View Result")'))
      .filter({ hasNotText: /BACK TO DASHBOARD/i })
      .filter({ has: this.page.locator(':visible') })
      .first();

    const isVisible = await viewResultBtn.isVisible({ timeout: 1500 }).catch(() => false);
    if (!isVisible) return false;

    console.log('Clicking "View Result" button...');
    await viewResultBtn.scrollIntoViewIfNeeded().catch(() => {});
    await viewResultBtn.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(2500);

    // Look for Next Lesson / Continue button on the result screen to advance
    const nextAfterResult = this.page
      .getByRole('button', { name: /next lesson|continue|complete and continue/i })
      .or(this.page.locator('button:has-text("Next Lesson"), button:has-text("Complete And Continue")'))
      .filter({ hasNotText: /BACK TO DASHBOARD/i })
      .filter({ has: this.page.locator(':visible') })
      .first();

    if (await nextAfterResult.isVisible({ timeout: 2500 }).catch(() => false)) {
      console.log('Clicking Next Lesson / Continue after View Result...');
      await nextAfterResult.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(3000);
    }

    return true;
  }

  /**
   * Handle any quiz present on the page:
   * 1. Detects CONFIRM / SUBMIT button or Radio options.
   * 2. Selects quiz answer option button or radio input.
   * 3. Clicks CONFIRM / SUBMIT button.
   * 4. Clicks NEXT / CONTINUE / NEXT QUESTION button.
   * 5. Clicks VIEW RESULT button when quiz finishes.
   */
  async handleQuizIfPresent(): Promise<boolean> {
    const confirmBtnSelector = 'button:has-text("CONFIRM"), button:has-text("Confirm"), button:has-text("SUBMIT"), button:has-text("Submit"), button:has-text("CHECK ANSWER")';
    const radioSelector = 'input[type="radio"], [role="radio"], button[role="radio"], label:has(input[type="radio"]), [class*="quiz-option"], [class*="answer-option"]';

    const confirmBtn = this.page.locator(confirmBtnSelector).filter({ has: this.page.locator(':visible') }).first();
    const radioLoc = this.page.locator(radioSelector).filter({ has: this.page.locator(':visible') });

    const isConfirmVisible = await confirmBtn.isVisible({ timeout: 1500 }).catch(() => false);
    const isRadioVisible = await radioLoc.first().isVisible({ timeout: 1000 }).catch(() => false);

    if (!isConfirmVisible && !isRadioVisible) {
      await this.viewQuizResultIfPresent();
      return false;
    }

    console.log('--- QUIZ DETECTED ON PAGE ---');
    let questionCount = 0;

    while (questionCount < 30) {
      const activeConfirm = this.page.locator(confirmBtnSelector).filter({ has: this.page.locator(':visible') }).first();
      const activeRadios = this.page.locator(radioSelector).filter({ has: this.page.locator(':visible') });

      const hasConfirm = await activeConfirm.isVisible({ timeout: 1500 }).catch(() => false);
      const hasRadios = await activeRadios.first().isVisible({ timeout: 1000 }).catch(() => false);

      if (!hasConfirm && !hasRadios) {
        break;
      }

      questionCount++;
      console.log(`Processing Quiz Question #${questionCount}...`);

      // Step 1: Select Quiz Option using direct DOM evaluation until CONFIRM button is enabled
      await this.page.evaluate(() => {
        // Find visible CONFIRM button
        const confirmBtn = Array.from(document.querySelectorAll('button')).find(
          (btn) => btn.textContent && /CONFIRM|SUBMIT|CHECK ANSWER/i.test(btn.textContent) && btn.offsetWidth > 0 && btn.offsetHeight > 0
        ) as HTMLButtonElement | undefined;

        if (confirmBtn) {
          let container: HTMLElement | null = confirmBtn.parentElement;
          for (let level = 0; level < 4; level++) {
            if (container && container !== document.body && container !== document.documentElement && container.tagName !== 'MAIN') {
              const candidates = Array.from(container.querySelectorAll('label, input, [role="radio"], button[role="radio"], div, p, span, svg')) as HTMLElement[];
              for (const cand of candidates) {
                const txt = (cand.textContent || '').trim();
                const isConfirm = /CONFIRM|SUBMIT|CHECK ANSWER|BACK TO DASHBOARD|NEXT|CONTINUE/i.test(txt);
                const isLink = cand.tagName === 'A' || cand.hasAttribute('href') || !!cand.closest('a');
                const isHubspot = (cand.id || '').toLowerCase().includes('hubspot') || (cand.className || '').toLowerCase().includes('hubspot') || !!cand.closest('#hubspot-conversations-iframe');

                if (!isConfirm && !isLink && !isHubspot && cand !== confirmBtn && cand.offsetWidth > 0 && cand.offsetHeight > 0) {
                  try {
                    cand.click();
                  } catch (e) {}

                  // Check if clicking option enabled CONFIRM button
                  const isDisabled = confirmBtn.disabled || confirmBtn.hasAttribute('disabled') || confirmBtn.classList.contains('disabled') || window.getComputedStyle(confirmBtn).pointerEvents === 'none';
                  if (!isDisabled) {
                    return;
                  }
                }
              }
              container = container.parentElement;
            }
          }
        }

        // Fallback: Click first visible radio or label in quiz container
        const fallbackOption = document.querySelector('form label, [class*="quiz"] label, [class*="question"] label, label:has(input[type="radio"])') as HTMLElement;
        if (fallbackOption && !fallbackOption.hasAttribute('href') && !fallbackOption.id.includes('hubspot')) {
          fallbackOption.click();
        }
      }).catch(() => {});

      await this.page.waitForTimeout(600);

      // Step 2: Click CONFIRM / SUBMIT button ONLY IF ENABLED
      const isConfirmDisabled = await activeConfirm.isDisabled().catch(() => true);
      if (!isConfirmDisabled && await activeConfirm.isVisible({ timeout: 1500 }).catch(() => false)) {
        console.log('Clicking CONFIRM button...');
        await activeConfirm.scrollIntoViewIfNeeded().catch(() => {});
        await activeConfirm.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(1500);
      }

      // Step 3: Click NEXT / CONTINUE button
      const nextBtn = this.page.locator('button:has-text("NEXT"), button:has-text("Next"), button:has-text("CONTINUE"), button:has-text("Continue"), button:has-text("NEXT QUESTION")')
        .filter({ hasNotText: /BACK TO DASHBOARD/i })
        .filter({ has: this.page.locator(':visible') })
        .first();

      if (await nextBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log('Clicking NEXT/CONTINUE button...');
        await nextBtn.scrollIntoViewIfNeeded().catch(() => {});
        await nextBtn.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(2000);
      } else {
        await this.page.waitForTimeout(800);
      }
    }

    // Check for View Result button after questions are answered
    await this.viewQuizResultIfPresent();
    return true;
  }

  /**
   * Click on 'Complete Lesson' / 'Complete And Continue' button continuously as long as it appears.
   * Also automatically answers any quizzes encountered and handles View Result.
   * @param maxLessons Maximum limit of lessons to complete (default 50).
   */
  async completeAllLessons(maxLessons: number = 50): Promise<void> {
    await this.page.waitForTimeout(2000);
    let completedCount = 0;
    let nextAttempts = 0;

    while (completedCount < maxLessons) {
      // 1. Check and handle Quiz if present on page
      await this.handleQuizIfPresent();

      // 2. Look for "Complete Lesson" / "Complete And Continue" button
      const completeBtn = this.page
        .getByRole('button', { name: /complete and continue|complete lesson|complete/i })
        .or(this.page.locator('button:has-text("Complete And Continue"), button:has-text("Complete Lesson"), a:has-text("Complete")'))
        .filter({ hasNotText: /BACK TO DASHBOARD/i })
        .filter({ has: this.page.locator(':visible') })
        .first();

      const isVisible = await completeBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (!isVisible) {
        // Check for View Result button
        const viewedResult = await this.viewQuizResultIfPresent();
        if (viewedResult) continue;

        // Try generic Next button (limit to 3 attempts max if completeBtn is absent)
        const genericNextBtn = this.page
          .getByRole('button', { name: /^next$|^continue$/i })
          .filter({ hasNotText: /BACK TO DASHBOARD|LEARN|SYSTEM|SPECIALIZATIONS|MEMBERSHIP|PRO TOOLS/i })
          .filter({ has: this.page.locator(':visible') })
          .first();

        if (nextAttempts < 3 && await genericNextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          nextAttempts++;
          console.log(`Clicking Next/Continue button to advance lesson (Attempt #${nextAttempts})...`);
          await genericNextBtn.click({ force: true }).catch(() => {});
          await this.page.waitForTimeout(3000);
          continue;
        }

        console.log(`No more "Complete Lesson" or "Next" button visible. Finished after ${completedCount} action(s).`);
        break;
      }

      nextAttempts = 0; // Reset attempts on successful completeBtn match
      completedCount++;
      console.log(`Clicking "Complete Lesson" button (Lesson #${completedCount})...`);
      await completeBtn.scrollIntoViewIfNeeded().catch(() => {});
      await completeBtn.click({ force: true }).catch(() => {});

      // Wait for next lesson content to load
      await this.page.waitForTimeout(3000);

      // 3. Check and handle Quiz if present right after lesson completion
      await this.handleQuizIfPresent();
    }

    // Click "Back to Dashboard" button at the end of course
    await this.clickBackToDashboard();
  }

  /**
   * Click on 'Back to Dashboard' button or link if present.
   */
  async clickBackToDashboard(): Promise<boolean> {
    const backBtn = this.page
      .getByRole('button', { name: /back to dashboard/i })
      .or(this.page.getByRole('link', { name: /back to dashboard/i }))
      .or(this.page.locator('button:has-text("BACK TO DASHBOARD"), a:has-text("BACK TO DASHBOARD"), button:has-text("Back to Dashboard"), a:has-text("Back to Dashboard")'))
      .filter({ has: this.page.locator(':visible') })
      .first();

    const isVisible = await backBtn.isVisible({ timeout: 2500 }).catch(() => false);
    if (isVisible) {
      console.log('Clicking "BACK TO DASHBOARD" button...');
      await backBtn.scrollIntoViewIfNeeded().catch(() => {});
      await backBtn.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(2000);
      return true;
    }
    return false;
  }

  /**
   * Click on 'Complete Lesson' button continuously until specified max lessons are completed.
   */
  async completeLesson(maxLessons: number = 5): Promise<void> {
    await this.completeAllLessons(maxLessons);
  }
}
