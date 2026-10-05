import { test, expect } from '../../src/fixtures/test.fixture';
import { testConfig } from '../../config/testConfig';

test.describe('FMS User Dashboard & Navigation Test Suite', () => {

  test.beforeEach(async ({ loginPage }) => {
    // Navigate to sign-in page before each test
    await loginPage.navigate();
  });

  test('Verify user can log in successfully with valid credentials', async ({ loginPage, dashboardPage, page }) => {
    const { email, password } = testConfig.getUser();

    // Perform Login
    await loginPage.login(email, password);

    // Verify Dashboard is loaded after login
    await dashboardPage.verifyDashboardLoaded();

    // Pause for 5 seconds after successful login so user can inspect dashboard UI
    await page.waitForTimeout(5000);
  });

  test('Verify user can navigate to My Courses and Exams tab', async ({ loginPage, dashboardPage, page }) => {
    const { email, password } = testConfig.getUser();

    // 1. Perform Login
    await loginPage.login(email, password);

    // 2. Verify Dashboard is loaded after login
    await dashboardPage.verifyDashboardLoaded();

    // 3. Click "My Courses" option
    await dashboardPage.navigateToMyCourses();

    // 4. Click "Exams" option
    await dashboardPage.navigateToExams();

    // 5. Verify Exams section is loaded successfully
    await dashboardPage.verifyExamsPageLoaded();

    // Pause for 5 seconds after navigation so user can inspect UI
    await page.waitForTimeout(5000);
  });

  test('Verify login page UI elements are visible and loaded correctly', async ({ loginPage }) => {
    await loginPage.verifyLoginPageLoaded();
    await expect(loginPage.forgotPasswordButton).toBeVisible();
  });

});
