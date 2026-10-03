import { test, expect } from '../../src/fixtures/test.fixture';
import { testConfig } from '../../config/testConfig';

test.describe('FMS Admin Portal Authentication & Navigation Suite', () => {

  test.beforeEach(async ({ adminLoginPage }) => {
    // Navigate to Admin sign-in page before each test
    await adminLoginPage.navigate();
  });

  test('Verify admin can log in successfully and navigate to Events menu', async ({ adminLoginPage, adminDashboardPage, adminEventsPage, page }) => {
    const { email, password } = testConfig.admin.credentials;

    // 1. Perform Admin Login
    await adminLoginPage.login(email, password);

    // 2. Verify Admin Dashboard is loaded
    await adminDashboardPage.verifyAdminDashboardLoaded();

    // 3. Click Events menu item in Sidebar
    await adminDashboardPage.navigateToEventsMenu();

    // 4. Verify Admin Events page is loaded
    await adminEventsPage.verifyAdminEventsPageLoaded();

    // 5. Pause 5 seconds after navigation for visual inspection
    await page.waitForTimeout(5000);
  });

  test('Verify admin login page UI elements display correctly', async ({ adminLoginPage }) => {
    await adminLoginPage.verifyAdminLoginPageLoaded();
  });

});
