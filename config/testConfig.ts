/**
 * Environment & Application Configuration
 */
export const testConfig = {
  baseUrl: process.env.BASE_URL || 'https://staging.functionalmovement.site',
  loginUrl: 'https://staging.functionalmovement.site/sign-in',
  dashboardUrl: 'https://staging.functionalmovement.site/user/dashboard',
  
  // Admin Portal Configuration
  admin: {
    loginUrl: 'https://admin-staging.functionalmovement.site/admin/login',
    dashboardUrl: 'https://admin-staging.functionalmovement.site/admin',
    credentials: {
      email: process.env.ADMIN_EMAIL || 'dev@fms.com',
      password: process.env.ADMIN_PASSWORD || 'K5Tqsg2J76Y]',
    },
  },

  credentials: {
    validUser: {
      email: process.env.TEST_EMAIL || 'testqa@gmail.com',
      password: process.env.TEST_PASSWORD || '123456789',
    },
    invalidUser: {
      email: 'invalid_qa@gmail.com',
      password: 'WrongPassword123!',
    },
  },
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
};
