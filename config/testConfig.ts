import usersData from './users.json';

export interface UserCredential {
  key?: string;
  name?: string;
  email: string;
  password: string;
}

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

  // List of pre-configured users from users.json
  users: usersData as UserCredential[],

  /**
   * Helper function to retrieve credentials for a user.
   * Priority:
   * 1. Command-line env vars (TEST_EMAIL & TEST_PASSWORD)
   * 2. Key matching in users.json (passed parameter or process.env.USER_KEY)
   * 3. First user in users.json or default fallback
   */
  getUser(userKey?: string): UserCredential {
    if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
      return {
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PASSWORD,
        name: 'Custom CLI User',
      };
    }

    const keyToSearch = userKey || process.env.USER_KEY;
    if (keyToSearch) {
      const found = (usersData as UserCredential[]).find(
        (u) => u.key?.toLowerCase() === keyToSearch.toLowerCase()
      );
      if (found) return found;
    }

    return (
      usersData[0] || {
        email: process.env.TEST_EMAIL || 'testqa@gmail.com',
        password: process.env.TEST_PASSWORD || '123456789',
        name: 'User1',
      }
    );
  },

  credentials: {
    validUser: {
      email: process.env.TEST_EMAIL || 'testqa@gmail.com',
      password: process.env.TEST_PASSWORD || '123456789',
      name: 'Default User',
    },
    invalidUser: {
      email: 'invalid_qa@gmail.com',
      password: 'WrongPassword123!',
      name: 'User2',
    },
  },
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
};
