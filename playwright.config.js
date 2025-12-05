"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }]
    ],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...test_1.devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...test_1.devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...test_1.devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...test_1.devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...test_1.devices['iPhone 12'] },
        },
        {
            name: 'Microsoft Edge',
            use: { ...test_1.devices['Desktop Edge'], channel: 'msedge' },
        },
        {
            name: 'Google Chrome',
            use: { ...test_1.devices['Desktop Chrome'], channel: 'chrome' },
        },
    ],
    webServer: [
        {
            command: 'npm run server:dev',
            url: 'http://localhost:3001/health',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
        {
            command: 'npm run client:dev',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
    ],
});
//# sourceMappingURL=playwright.config.js.map