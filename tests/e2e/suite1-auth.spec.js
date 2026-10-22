import { test, expect } from '@playwright/test';
import { clearStorage, seedUserAuth } from './helpers/seedStorage.js';

test.describe('Suite 1: Authentication & Routing (RBAC)', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure complete isolation
    await clearStorage(page);
  });

  test('Admin Login: should login with valid doctor credentials and redirect to /admin/dashboard', async ({ page }) => {
    await page.goto('/admin/login');

    // Fill credentials
    const usernameInput = page.locator('[data-testid="login-username"]').or(page.locator('input[type="text"]').first());
    const passwordInput = page.locator('[data-testid="login-password"]').or(page.locator('input[type="password"]'));
    const submitBtn = page.locator('[data-testid="login-submit"]').or(page.getByRole('button', { name: /Access Doctor Console/i }));

    await usernameInput.fill('doctor');
    await passwordInput.fill('peds2026');
    await submitBtn.click();

    // Expect redirect to /admin/dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByText('Doctor Workspace').or(page.getByText('Dr. B. Sivakumar'))).toBeVisible();
  });

  test('User Login: should login with receptionist credentials and redirect to user dashboard/workspace', async ({ page }) => {
    await page.goto('/user/login');

    // Fill credentials
    const usernameInput = page.locator('[data-testid="login-username"]').or(page.locator('input[type="text"]').first());
    const passwordInput = page.locator('[data-testid="login-password"]').or(page.locator('input[type="password"]'));
    const submitBtn = page.locator('[data-testid="login-submit"]').or(page.getByRole('button', { name: /Access Reception Desk/i }));

    await usernameInput.fill('reception');
    await passwordInput.fill('frontdesk2026');
    await submitBtn.click();

    // Expect redirect to /user/workspace (or /user/dashboard redirect)
    await expect(page).toHaveURL(/\/user\/(dashboard|workspace)/);
    await expect(page.getByText('Front Desk').or(page.getByText('System Controller'))).toBeVisible();
  });

  test('Route Protection (Negative): unauthenticated access to /admin/dashboard redirects to /admin/login', async ({ page }) => {
    // Attempt visiting protected admin route without logging in
    await page.goto('/admin/dashboard');

    // Expect guard to redirect to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText(/Doctor Portal Sign In/i)).toBeVisible();
  });

  test('Route Protection (Negative): User (Receptionist) attempting to visit /admin/dashboard is redirected to /admin/login', async ({ page }) => {
    // Seed only user (receptionist) session
    await seedUserAuth(page);

    // Directly attempt to access Doctor admin route
    await page.goto('/admin/dashboard');

    // Expect strict RBAC guard to deny access and redirect to doctor login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText(/Doctor Portal Sign In/i)).toBeVisible();
  });
});
