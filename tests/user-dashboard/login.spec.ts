import { test, expect } from '../../src/fixtures/test.fixture';
import { testConfig } from '../../config/testConfig';

test.describe('FMS User Authentication Test Suite', () => {

  test.beforeEach(async ({ loginPage }) => {
    // Navigate to sign-in page before each test
    await loginPage.navigate();
  });

  test('Verify user can log in successfully with valid credentials', async ({ loginPage, dashboardPage, page }) => {
    const { email, password } = testConfig.credentials.validUser;

    // Perform Login
    await loginPage.login(email, password);

    // Verify Dashboard is loaded after login
    await dashboardPage.verifyDashboardLoaded();

    // Pause for 5 seconds after successful login so user can inspect dashboard UI
    await page.waitForTimeout(5000);
  });

  test('Verify login page UI elements are visible and loaded correctly', async ({ loginPage }) => {
    await loginPage.verifyLoginPageLoaded();
    await expect(loginPage.forgotPasswordButton).toBeVisible();
  });

});
