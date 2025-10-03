# 🧪 Testing Guide - PM Application v2

## 📋 **Overview**

This guide covers the comprehensive testing strategy implemented for the PM Application v2. The testing infrastructure includes unit tests, integration tests, and end-to-end (E2E) tests to ensure code quality, reliability, and user experience.

---

## 🏗️ **Testing Architecture**

### **Testing Pyramid**

```
        🔺 E2E Tests (10%)
       🔺🔺 Integration Tests (20%)
    🔺🔺🔺 Unit Tests (70%)
```

**Unit Tests (70%)** - Fast, isolated component/service testing  
**Integration Tests (20%)** - API endpoints and component interactions  
**E2E Tests (10%)** - Full user workflows and critical paths

---

## 🔗 **System Connectivity Testing**

System connectivity tests ensure that all system components can communicate properly and that health monitoring works correctly.

### **Test Categories**

#### **Health Endpoint Tests** (`tests/integration/system/connectivity.test.ts`)
- ✅ **Basic health check** - `/health/basic` endpoint response
- ✅ **Detailed health check** - `/health/detailed` endpoint with comprehensive system status
- ✅ **Readiness probe** - `/health/ready` endpoint for service readiness
- ✅ **Liveness probe** - `/health/live` endpoint for service liveness
- ✅ **Database connectivity** - Database connection status and response times
- ✅ **API accessibility** - All API endpoints are reachable
- ✅ **System resource monitoring** - Memory usage, CPU load, performance metrics
- ✅ **Response time performance** - Endpoints respond within acceptable time limits
- ✅ **Concurrent request handling** - Multiple simultaneous health checks
- ✅ **Error handling** - Graceful degradation when services are down

#### **Health Check Script Tests** (`tests/integration/system/health-check-script.test.ts`)
- ✅ **Script execution** - Health check script runs successfully
- ✅ **Output validation** - Report structure, timestamps, response times
- ✅ **Error handling** - Behavior when services are down
- ✅ **Environment configuration** - Custom host/port settings
- ✅ **Performance testing** - Execution time and memory usage limits
- ✅ **Concurrent execution** - Multiple script instances

#### **Configuration Validation Tests** (`tests/integration/system/configuration-validation.test.ts`)
- ✅ **Script execution** - Configuration validation script works correctly
- ✅ **Valid configuration** - Proper validation passes with correct config
- ✅ **Invalid configuration** - Validation fails with bad configuration
- ✅ **Secret generation** - Secret generation script produces unique, secure secrets
- ✅ **Integration testing** - Configuration validation after secret generation
- ✅ **Performance testing** - Execution time and concurrent validation

### **Running System Connectivity Tests**

```bash
# Run all system connectivity tests
npm run test:system

# Run specific test categories
npm run test:connectivity        # Health endpoints & connectivity
npm run test:health-scripts      # Health check script tests
npm run test:config-validation   # Configuration validation tests

# Run with verbose output
npm run test:system -- --reporter=verbose

# Run with coverage
npm run test:system -- --coverage
```

### **Test Coverage**

System connectivity tests provide comprehensive coverage of:
- **Health monitoring endpoints** - All health check endpoints
- **Database connectivity** - Connection status, response times, error handling
- **API accessibility** - Endpoint availability and proper responses
- **System resources** - Memory, CPU, and performance monitoring
- **Configuration validation** - Environment variables and security validation
- **Error scenarios** - Graceful handling of service failures
- **Performance requirements** - Response time and resource usage limits

---

## 🛠️ **Testing Technologies**

### **Unit Testing**
- **Vitest** - Fast, Vite-native testing framework
- **React Testing Library** - Component testing with user-centric approach
- **MSW (Mock Service Worker)** - API mocking for isolated testing
- **@testing-library/jest-dom** - Custom matchers for DOM testing

### **Integration Testing**
- **Supertest** - HTTP assertion library for API testing
- **Vitest** - Test runner for integration tests
- **MySQL Test Database** - Isolated database for testing

### **E2E Testing**
- **Playwright** - Cross-browser testing with excellent debugging
- **Test Containers** - Database integration testing
- **Lighthouse CI** - Performance and accessibility testing

---

## 📁 **Test Structure**

```
tests/
├── setup.ts                    # Global test setup
├── mocks/                      # Mock implementations
│   ├── handlers.ts            # MSW API handlers
│   └── server.ts              # MSW server setup
├── integration/                # Integration tests (20%)
│   ├── api/                   # API endpoint tests
│   │   └── projects.test.ts   # Projects API tests
│   ├── system/                # System connectivity tests
│   │   ├── connectivity.test.ts           # Health endpoints & connectivity
│   │   ├── health-check-script.test.ts    # Health check script tests
│   │   └── configuration-validation.test.ts # Config validation tests
│   └── database/              # Database integration tests
├── e2e/                       # End-to-end tests (10%)
│   ├── user-workflows/        # Critical user journeys
│   │   └── project-creation.spec.ts
│   └── performance/           # Performance tests
└── server/                    # Server test utilities
    └── test-utils.ts          # Test helper functions

src/client/tests/
├── setup.ts                   # Client test setup
├── mocks/                     # Client mocks
│   ├── handlers.ts           # Client MSW handlers
│   └── server.ts             # Client MSW server
└── unit/                      # Unit tests (70%)
    ├── components/           # React component tests
    │   ├── ErrorBoundary.test.tsx
    │   ├── EnhancedLoadingSpinner.test.tsx
    │   └── ToastNotification.test.tsx
    ├── services/             # Service tests
    │   └── apiService.test.ts
    └── utils/                # Utility function tests
```

---

## 🚀 **Running Tests**

### **Unit Tests**

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with UI
npm run test:unit:ui

# Run unit tests with coverage
npm run test:coverage
```

### **Integration Tests**

```bash
# Run integration tests
npm run test:integration
```

### **E2E Tests**

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npx playwright test --headed
```

### **All Tests**

```bash
# Run all tests
npm run test:all
```

---

## 📝 **Writing Tests**

### **Unit Test Example**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>No error</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

### **Integration Test Example**

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../server/test-utils';

describe('Projects API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  it('should return projects list', async () => {
    const response = await request(app.server)
      .get('/api/v1/projects')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });
});
```

### **E2E Test Example**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Project Creation Workflow', () => {
  test('should create a new project successfully', async ({ page }) => {
    await page.goto('/');
    
    // Login if needed
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    if (isLoginPage) {
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
    }

    // Create project
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[name="name"]', 'E2E Test Project');
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=Project created successfully')).toBeVisible();
  });
});
```

---

## 🎯 **Test Coverage Goals**

### **Coverage Targets**
- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: 90%+ API endpoint coverage
- **E2E Tests**: 100% critical user journey coverage

### **Quality Metrics**
- **Test Execution Time**: < 5 minutes
- **Flaky Test Rate**: < 1%
- **Test Maintenance Overhead**: < 20%

---

## 🔧 **Test Configuration**

### **Vitest Configuration**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### **Playwright Configuration**

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ]
});
```

---

## 🧪 **Test Categories**

### **Unit Tests**

**Component Tests:**
- Rendering and props
- User interactions (clicks, form inputs)
- Error states and loading states
- Accessibility (ARIA labels, keyboard navigation)

**Service Tests:**
- API service methods
- Error handling and retry logic
- Data transformation and validation
- Offline/online state management

**Utility Tests:**
- Pure functions with various inputs
- Edge cases and error conditions
- Performance-critical functions
- Data validation and sanitization

### **Integration Tests**

**API Integration:**
- Real database connections
- Authentication flows
- Data persistence and retrieval
- Error responses and status codes

**Component Integration:**
- Component interactions
- State management flows
- Routing and navigation
- Form submissions and validations

### **E2E Tests**

**Critical User Workflows:**
- User registration/login
- Project creation and management
- Schedule management
- AI task breakdown
- PWA installation
- Share target functionality

**Cross-Browser Testing:**
- Chrome, Firefox, Safari, Edge
- Mobile browsers
- PWA installation
- Offline functionality

---

## 🚨 **Error Handling Tests**

### **Network Errors**
```typescript
test('should handle network errors gracefully', async ({ page }) => {
  await page.route('**/api/v1/projects', route => route.abort());
  
  await page.click('button:has-text("Create Project")');
  
  await expect(page.locator('text=Failed to create project')).toBeVisible();
});
```

### **Validation Errors**
```typescript
test('should validate required fields', async ({ page }) => {
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Name is required')).toBeVisible();
});
```

### **Authentication Errors**
```typescript
test('should handle 401 unauthorized errors', async () => {
  mockAxios.get.mockRejectedValue({
    response: { status: 401, data: { message: 'Unauthorized' } }
  });

  await expect(apiService.getProjects()).rejects.toThrow();
});
```

---

## 📊 **Performance Testing**

### **Load Testing**
```typescript
test('should handle multiple concurrent requests', async () => {
  const requests = Array(10).fill(null).map(() => 
    request(app.server).get('/api/v1/projects')
  );
  
  const responses = await Promise.all(requests);
  
  responses.forEach(response => {
    expect(response.status).toBe(200);
  });
});
```

### **Memory Testing**
```typescript
test('should not have memory leaks', async ({ page }) => {
  const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  
  // Perform memory-intensive operations
  for (let i = 0; i < 100; i++) {
    await page.click('button:has-text("Create Project")');
    await page.click('button:has-text("Cancel")');
  }
  
  const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  
  expect(finalMemory - initialMemory).toBeLessThan(10 * 1024 * 1024); // 10MB
});
```

---

## 🔍 **Accessibility Testing**

### **Screen Reader Testing**
```typescript
test('should be accessible to screen readers', async ({ page }) => {
  await page.goto('/');
  
  // Check for proper ARIA labels
  const button = page.locator('button:has-text("Create Project")');
  expect(await button.getAttribute('aria-label')).toBeTruthy();
  
  // Check for proper heading structure
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  expect(await headings.count()).toBeGreaterThan(0);
});
```

### **Keyboard Navigation**
```typescript
test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  
  // Check focus is visible
  const focusedElement = page.locator(':focus');
  expect(await focusedElement.count()).toBe(1);
});
```

---

## 🚀 **CI/CD Integration**

### **GitHub Actions**
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 📈 **Test Metrics & Reporting**

### **Coverage Reports**
- **HTML Reports**: Detailed coverage with line-by-line analysis
- **JSON Reports**: Machine-readable coverage data
- **Text Reports**: Console-friendly coverage summary

### **Test Results**
- **JUnit XML**: CI/CD integration
- **HTML Reports**: Detailed test results with screenshots
- **JSON Reports**: Machine-readable test results

### **Performance Metrics**
- **Test Execution Time**: Track test performance over time
- **Flaky Test Detection**: Identify and fix unstable tests
- **Coverage Trends**: Monitor coverage changes over time

---

## 🛠️ **Debugging Tests**

### **Unit Test Debugging**
```bash
# Run specific test file
npm run test:unit ErrorBoundary.test.tsx

# Run tests with verbose output
npm run test:unit -- --reporter=verbose

# Debug tests in VS Code
# Add breakpoints and use "Debug Test" command
```

### **E2E Test Debugging**
```bash
# Run tests in headed mode
npx playwright test --headed

# Run specific test
npx playwright test project-creation.spec.ts

# Debug mode
npx playwright test --debug

# Generate trace files
npx playwright test --trace on
```

---

## 📚 **Best Practices**

### **Test Writing**
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Test one thing per test
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Execution**: Keep tests fast and efficient

### **Mocking**
1. **Mock External Dependencies**: Don't test third-party code
2. **Use MSW for API Mocking**: Consistent API mocking
3. **Mock at the Right Level**: Mock interfaces, not implementations
4. **Keep Mocks Simple**: Avoid complex mock setups

### **Maintenance**
1. **Regular Updates**: Keep test dependencies updated
2. **Remove Dead Tests**: Delete tests for removed features
3. **Refactor Tests**: Improve test quality over time
4. **Monitor Performance**: Track test execution time

---

## 🎯 **Future Enhancements**

### **Planned Improvements**
1. **Visual Regression Testing**: Screenshot comparisons
2. **Performance Testing**: Load and stress testing
3. **Security Testing**: Automated security scans
4. **Accessibility Testing**: Automated a11y checks

### **Advanced Features**
1. **Test Data Management**: Automated test data generation
2. **Parallel Execution**: Faster test execution
3. **Smart Test Selection**: Run only affected tests
4. **Test Analytics**: Advanced test metrics and insights

---

## 📞 **Support & Resources**

### **Documentation**
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)

### **Tools**
- **VS Code Extensions**: Vitest, Playwright Test Runner
- **Browser DevTools**: Network, Performance, Accessibility tabs
- **Test Analytics**: Coverage reports, performance metrics

---

*This testing guide provides comprehensive coverage of the testing strategy for PM Application v2. Regular updates ensure the testing infrastructure remains effective and maintainable.*
