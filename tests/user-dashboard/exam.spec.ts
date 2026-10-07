import { test, expect } from '../../src/fixtures/test.fixture';
import { testConfig } from '../../config/testConfig';


const TARGET_COURSE_ID_OR_NAME = 'FMS Corrective Strategies: Rotation Patterns';

test.describe('FMS User Dashboard Exams Test Suite', () => {

  test.beforeEach(async ({ loginPage }) => {
    // Navigate to sign-in page before each test
    await loginPage.navigate();
  });

  test('Verify user can navigate to Exams tab and take test by course ID or Name', async ({ loginPage, dashboardPage, page }) => {
    const user = testConfig.getUser('User1');

    // 1. Perform Login
    await loginPage.login(user.email, user.password);

    // 2. Verify Dashboard is loaded after login
    await dashboardPage.verifyDashboardLoaded();

    // 3. Click "My Courses" option
    await dashboardPage.navigateToMyCourses();

    // 4. Click "Exams" option
    await dashboardPage.navigateToExams();

    // 5. Verify Exams section is loaded successfully
    await dashboardPage.verifyExamsPageLoaded();

    // 6. Click "Take Test" button for the specified Course (by ID or Name)
    await dashboardPage.takeTestByCourse(TARGET_COURSE_ID_OR_NAME);

    // Pause for 5 seconds after clicking Take Test button so user can inspect UI
    await page.waitForTimeout(5000);
  });

});
