import { test, expect } from '../../src/fixtures/test.fixture';
import { testConfig } from '../../config/testConfig';

test.describe('FMS User Dashboard Course Navigation Test Suite', () => {

  test.beforeEach(async ({ loginPage }) => {
    // Navigate to sign-in page before each test
    await loginPage.navigate();
  });

  test('Verify user can navigate to My Courses, open a specific course by ID, and start the course', async ({ loginPage, dashboardPage, coursePage, page }) => {
    // Set 5 minute timeout for test to allow completing multiple lessons and quizzes
    test.setTimeout(300000);

    // Retrieve user credentials dynamically (defaults to user1, or selects via USER_KEY / TEST_EMAIL env vars)
    const user = testConfig.getUser("user2");
    const targetCourseId = process.env.TEST_COURSE_ID || '364831';

    // 1. Perform Login
    await loginPage.login(user.email, user.password);

    // 2. Verify Dashboard is loaded after login & hide floating AI chat bar
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.hideChatWidget();

    // 3. Click "My Courses" option
    await dashboardPage.navigateToMyCourses();

    // 4. Open specific course by Course ID
    await coursePage.openCourseById(targetCourseId);

    // 5. Verify course page is loaded
    await coursePage.verifyCoursePageLoaded(targetCourseId);

    // 6. Click "Start Course" / "Resume Course" button to start the course
    await coursePage.startCourse();

    // 7. Click "Complete Lesson" button
    await coursePage.completeLesson();

    // 8. Click "Back to Dashboard" button at the end of the course
    await coursePage.clickBackToDashboard();

    // Pause for 3 seconds after completing lesson so user can inspect UI
    await page.waitForTimeout(3000);
  });

});
