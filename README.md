# 🚀 FMS Automation Framework (Playwright + TypeScript)

Automated end-to-end (E2E) testing framework for **Functional Movement Systems (FMS)** built with Playwright, TypeScript, and Page Object Model (POM) architecture.

---

## 📂 Project Architecture

```text
FMS-Automation/
├── config/
│   └── testConfig.ts           # Centralized configuration (User & Admin credentials, URLs)
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── adminLogin.page.ts     # Admin Login Page Object
│   │   │   └── adminDashboard.page.ts # Admin Dashboard Page Object
│   │   ├── base.page.ts        # BasePage wrapper (common navigation, title & URL helpers)
│   │   ├── login.page.ts       # User Login Page Object
│   │   └── dashboard.page.ts   # User Dashboard Page Object
│   └── fixtures/
│       └── test.fixture.ts     # Custom Playwright fixture for Dependency Injection
├── tests/
│   ├── admin/
│   │   └── adminLogin.spec.ts  # Admin Portal Authentication Test Suite
│   └── user-dashboard/
│       ├── login.spec.ts       # User Authentication Test Suite
│       └── exam.spec.ts        # User Dashboard Exams Test Suite
├── package.json                # Project dependencies & npm test scripts
├── playwright.config.ts        # Playwright framework configuration (Maximized Fullscreen Enabled)
└── README.md                   # Project documentation & execution guide
```

---

## 🛠️ Prerequisites & Installation

1. **Node.js**: Ensure Node.js (v18 or higher) is installed on your system.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Install Playwright Browsers**:
   ```bash
   npx playwright install
   ```

---

## 🧪 Test Execution Commands (টেস্ট রান করার নির্দেশিকা)

| Command | Description / বিবরণ |
| :--- | :--- |
| `npm run test:admin:headed` | **Admin Login Test ফুলস্ক্রিন Chrome উইন্ডোতে ১বার রান করবে।** |
| `npm run test:admin` | Admin Portal Test ব্যাকগ্রাউন্ডে (Headless) রান করবে। |
| `npm run test:login:headed` | User Login Test ফুলস্ক্রিন Chrome উইন্ডোতে ১বার রান করবে। |
| `npm run test:exam:headed` | User Exam Test ফুলস্ক্রিন Chrome উইন্ডোতে ১বার রান করবে। |
| `npm run test:exam` | User Exam Test Suite ব্যাকগ্রাউন্ডে (Headless) রান করবে। |
| `npm run test:user-dashboard:headed` | User Dashboard Suite এর সব টেস্ট ফুলস্ক্রিন Chrome উইন্ডোতে রান করবে। |
| `npm run test:user-dashboard` | User Dashboard Test Suite ব্যাকগ্রাউন্ডে (Headless) রান করবে। |
| `npm run test:headed` | সব টেস্ট Chrome Headed Maximize মোডে রান করবে। |
| `npm test` | হেডলেস (Headless) ব্যাকগ্রাউন্ডে সব টেস্ট রান করবে। |
| `npm run test:ui` | Playwright Interactive UI Mode চালু করবে। |
| `npm run report` | টেস্ট শেষে পাওয়া HTML রিপোর্ট ব্রাউজারে দেখাবে। |

