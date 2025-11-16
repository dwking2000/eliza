import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests for ElizaOS Tauri app
 *
 * These tests verify that:
 * - The app loads without errors
 * - The page has the correct title
 * - Basic UI elements are present
 */

test.describe('ElizaOS App - Basic Loading', () => {
  test('should load the app successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // Check that the page title is correct
    await expect(page).toHaveTitle('ElizaOS');
  });

  test('should have dark mode enabled', async ({ page }) => {
    await page.goto('/');

    // Check that the html element has the 'dark' class
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow some time for any delayed errors
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (if any)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('favicon') && // Favicon errors are non-critical
        !error.includes('DevTools') // DevTools warnings are non-critical
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have root element', async ({ page }) => {
    await page.goto('/');

    // Check that the root element exists
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});
