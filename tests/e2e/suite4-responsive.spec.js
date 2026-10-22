import { test, expect } from '@playwright/test';
import { seedAdminAuth, seedPatients, clearStorage } from './helpers/seedStorage.js';

test.describe('Suite 4: Responsive Mobile Testing (Crucial)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Set Playwright viewport strictly to mobile (width: 375, height: 667)
    await page.setViewportSize({ width: 375, height: 667 });
    await clearStorage(page);
    await seedAdminAuth(page);
    await seedPatients(page);
  });

  test('Sidebar Navigation: Off-canvas drawer slides in on mobile hamburger and closes on backdrop click', async ({ page }) => {
    await page.goto('/admin/dashboard');

    const sidebar = page.locator('[data-testid="app-sidebar"]').or(page.locator('aside'));
    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-btn"]');

    // Assert hamburger button is visible on mobile
    await expect(mobileMenuBtn).toBeVisible();

    // Verify sidebar is hidden / translated off-canvas by default (-translate-x-full)
    await expect(sidebar).toHaveClass(/(-translate-x-full)/);

    // Click the Hamburger menu
    await mobileMenuBtn.click();

    // Assert the sidebar slides in (translate-x-0)
    await expect(sidebar).toHaveClass(/translate-x-0/);

    // Click backdrop overlay to close sidebar
    const backdrop = page.locator('[data-testid="sidebar-backdrop"]');
    await expect(backdrop).toBeVisible();
    await backdrop.click();

    // Assert sidebar closes
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });

  test('Layout Integrity: Mobile line items stack vertically (flex-col) without horizontal document overflow', async ({ page }) => {
    await page.goto('/admin/workspace?patientId=SCC-P1001');

    // Scroll to Billing Engine section
    const billingSection = page.locator('[data-testid="billing-engine-section"]').or(page.getByText(/Billing Engine/i));
    await expect(billingSection).toBeVisible();
    await billingSection.scrollIntoViewIfNeeded();

    // Locate line item row
    const lineItemRow = page.locator('[data-testid="billing-line-item-row"]').first();
    await expect(lineItemRow).toBeVisible();

    // Assert line item row has flex-col for vertical stacking on mobile
    await expect(lineItemRow).toHaveClass(/flex-col/);

    // Assert no body horizontal overflow on mobile (document width <= viewport width)
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test('Mobile Header: Remains stationary/sticky at top when scrolling down the page', async ({ page }) => {
    await page.goto('/admin/workspace?patientId=SCC-P1001');

    const mobileHeader = page.locator('[data-testid="mobile-header"]');
    await expect(mobileHeader).toBeVisible();

    // Verify initial position at top of viewport
    const initialBox = await mobileHeader.boundingBox();
    expect(initialBox).not.toBeNull();
    expect(initialBox.y).toBe(0);

    // Scroll down the scrollable page content
    const scrollContainer = page.locator('.custom-scrollbar').first();
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 400;
    });

    // Verify header remains visible and pinned at top (y === 0)
    await expect(mobileHeader).toBeVisible();
    const scrolledBox = await mobileHeader.boundingBox();
    expect(scrolledBox).not.toBeNull();
    expect(scrolledBox.y).toBe(0);
  });
});
