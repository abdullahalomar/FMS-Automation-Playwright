import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { AdminLoginPage } from '../pages/admin/adminLogin.page';
import { AdminDashboardPage } from '../pages/admin/adminDashboard.page';
import { AdminEventsPage } from '../pages/admin/adminEvents.page';

// Declare fixture types
type PageObjects = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  adminLoginPage: AdminLoginPage;
  adminDashboardPage: AdminDashboardPage;
  adminEventsPage: AdminEventsPage;
};

/**
 * Custom Playwright test fixture extending base test with pre-instantiated Page Objects.
 */
export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  adminLoginPage: async ({ page }, use) => {
    const adminLoginPage = new AdminLoginPage(page);
    await use(adminLoginPage);
  },

  adminDashboardPage: async ({ page }, use) => {
    const adminDashboardPage = new AdminDashboardPage(page);
    await use(adminDashboardPage);
  },

  adminEventsPage: async ({ page }, use) => {
    const adminEventsPage = new AdminEventsPage(page);
    await use(adminEventsPage);
  },
});

export { expect } from '@playwright/test';
