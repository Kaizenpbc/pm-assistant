import { test, expect } from '@playwright/test';

test.describe('Project Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should create a new project successfully', async ({ page }) => {
    // Check if we're on the login page or dashboard
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    
    if (isLoginPage) {
      // Login first
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
    }

    // Navigate to create project page
    await page.click('button:has-text("Create New Project")');
    
    // Wait for the create project form to appear
    await page.waitForSelector('form');
    
    // Fill in project details
    await page.fill('input[name="name"]', 'E2E Test Project');
    await page.fill('textarea[name="description"]', 'This is a test project created by E2E tests');
    
    // Select project status
    await page.selectOption('select[name="status"]', 'active');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    await page.waitForSelector('text=Project created successfully', { timeout: 10000 });
    
    // Verify the project appears in the projects list
    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Check if we're on the login page or dashboard
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    
    if (isLoginPage) {
      // Login first
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
    }

    // Navigate to create project page
    await page.click('button:has-text("Create New Project")');
    
    // Wait for the create project form to appear
    await page.waitForSelector('form');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Check if we're on the login page or dashboard
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    
    if (isLoginPage) {
      // Login first
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
    }

    // Mock network failure
    await page.route('**/api/v1/projects', route => route.abort());
    
    // Navigate to create project page
    await page.click('button:has-text("Create New Project")');
    
    // Wait for the create project form to appear
    await page.waitForSelector('form');
    
    // Fill in project details
    await page.fill('input[name="name"]', 'Network Error Test Project');
    await page.fill('textarea[name="description"]', 'This project should fail due to network error');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Failed to create project')).toBeVisible();
  });
});

test.describe('Schedule Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Login if needed
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    
    if (isLoginPage) {
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
    }
  });

  test('should create and manage a schedule', async ({ page }) => {
    // Navigate to a project (assuming there's at least one)
    await page.click('button:has-text("View Schedule")');
    
    // Wait for schedule page to load
    await page.waitForSelector('text=Schedule Management');
    
    // Create a new schedule
    await page.click('button:has-text("Save Schedule")');
    
    // Wait for success message
    await page.waitForSelector('text=Schedule saved successfully', { timeout: 10000 });
    
    // Add phases to the schedule
    await page.click('button:has-text("Add Phases")');
    
    // Select a phase
    await page.click('button:has-text("Project Initiation Phase")');
    
    // Save the schedule with phases
    await page.click('button:has-text("Save Schedule")');
    
    // Wait for success message
    await page.waitForSelector('text=Schedule saved successfully', { timeout: 10000 });
    
    // Verify phases are added
    await expect(page.locator('text=Project Initiation Phase')).toBeVisible();
  });

  test('should use AI task breakdown', async ({ page }) => {
    // Navigate to a project
    await page.click('button:has-text("View Schedule")');
    
    // Wait for schedule page to load
    await page.waitForSelector('text=Schedule Management');
    
    // Use AI task breakdown
    await page.click('button:has-text("AI Task Breakdown")');
    
    // Wait for AI breakdown modal
    await page.waitForSelector('text=AI Task Breakdown');
    
    // Enter project description
    await page.fill('textarea[name="description"]', 'School construction project with multiple phases');
    
    // Generate tasks
    await page.click('button:has-text("Generate Tasks")');
    
    // Wait for AI response
    await page.waitForSelector('text=Tasks generated successfully', { timeout: 30000 });
    
    // Save the AI-generated schedule
    await page.click('button:has-text("Save Schedule")');
    
    // Wait for success message
    await page.waitForSelector('text=Schedule saved successfully', { timeout: 10000 });
  });
});

test.describe('PWA Features', () => {
  test('should install as PWA', async ({ page, context }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if install prompt appears (this might not always show)
    const installButton = page.locator('button:has-text("Install")');
    
    if (await installButton.isVisible()) {
      await installButton.click();
      
      // Verify PWA installation
      await expect(page.locator('text=App installed successfully')).toBeVisible();
    }
  });

  test('should work offline', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Login if needed
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    
    if (isLoginPage) {
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
    }
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to navigate to a page
    await page.click('button:has-text("View Schedule")');
    
    // Should still work due to service worker caching
    await expect(page.locator('text=Schedule Management')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
  });
});
