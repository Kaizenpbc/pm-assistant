import { test, expect } from '@playwright/test';

test.describe('Region Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('unauthenticated user can view region info (citizen-like)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const regionLink = page.locator('text=Barima-Waini').first();
    if (await regionLink.isVisible()) {
      await regionLink.click();
      await expect(page).toHaveURL(/\/region\/region-001\/info/);
      await expect(page.locator('text=Overview').or(page.locator('text=Notices')).or(page.locator('text=Project'))).toBeVisible();
    }
  });

  test('direct navigation to /region/region-001/info shows region page', async ({ page }) => {
    await page.goto('/region/region-001/info');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/region\/region-001\/info/);
  });

  test('404 page shows for unknown route', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page not found')).toBeVisible();
  });
});
