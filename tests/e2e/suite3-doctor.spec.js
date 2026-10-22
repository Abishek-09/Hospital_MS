import { test, expect } from '@playwright/test';
import { seedAdminAuth, seedPatients, clearStorage } from './helpers/seedStorage.js';

test.describe('Suite 3: Admin/Doctor Flow (/admin/*)', () => {

  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await seedAdminAuth(page);
    await seedPatients(page);
  });

  test('Read-Only Patient Directory: "Add Patient" button does NOT exist on Doctor view', async ({ page }) => {
    await page.goto('/admin/patients');

    // Confirm doctor views directory
    await expect(page.getByText(/Patients Directory \(Doctor View\)/i)).toBeVisible();

    // Assert that the "Add Patient" button does NOT exist
    await expect(page.locator('[data-testid="add-patient-btn"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /(Add Patient|Register New Patient)/i })).toHaveCount(0);
  });

  test('Full Clinical Workspace: Fill vitals, quick-add pill "+ Fever", billing autocomplete edge cases, and Save Visit', async ({ page }) => {
    // Navigate to doctor visit workspace
    await page.goto('/admin/workspace?patientId=SCC-P1001');

    // Verify clinical sections exist for Doctor
    await expect(page.locator('[data-testid="clinical-consultation-section"]').or(page.getByText(/Current Clinical Consultation/i))).toBeVisible();
    await expect(page.locator('[data-testid="billing-engine-section"]').or(page.getByText(/Billing Engine/i))).toBeVisible();

    // 1. Fill out Vitals (Weight: 14.5, Temp: 98.6)
    const weightInput = page.locator('[data-testid="vitals-weight"]').or(page.getByPlaceholder(/12.5/i));
    const tempInput = page.locator('[data-testid="vitals-temp"]').or(page.getByPlaceholder(/99.2/i));

    await weightInput.fill('14.5');
    await tempInput.fill('98.6');
    await expect(weightInput).toHaveValue('14.5');
    await expect(tempInput).toHaveValue('98.6');

    // 2. Fill Chief Complaint using quick-add pill ("+ Fever")
    const feverPill = page.locator('[data-testid="pill-fever"]').or(page.getByRole('button', { name: /\+ Fever/i }));
    await feverPill.click();

    const complaintArea = page.getByPlaceholder(/High fever x 2 days/i);
    await expect(complaintArea).toHaveValue(/Fever/);

    // 3. Billing Engine Edge Cases:
    // Click "+ Add item"
    const addItemBtn = page.locator('[data-testid="billing-add-item-btn"]').or(page.getByRole('button', { name: /\+ Add item/i }));
    await addItemBtn.click();

    // Find newly added item row description input
    const descInputs = page.locator('[data-testid="billing-desc-input"]').or(page.getByPlaceholder(/Item description/i));
    const lastDescInput = descInputs.last();

    // Type "Paracetamol" in the description; assert autocomplete dropdown appears
    await lastDescInput.fill('Paracetamol');
    const autocompleteDropdown = page.locator('[data-testid="billing-autocomplete-dropdown"]').or(page.getByText(/Paracetamol Syrup/i));
    await expect(autocompleteDropdown).toBeVisible();

    // Select "Paracetamol Syrup"
    const suggestionItem = page.locator('[data-testid="billing-suggestion-paracetamol-syrup"]').or(page.getByText('Paracetamol Syrup').first());
    await suggestionItem.click();

    // Assert the Type dropdown automatically switches to "Syrup"
    const typeSelects = page.locator('[data-testid="billing-type-select"]').or(page.locator('select:has-text("Syrup")'));
    const lastTypeSelect = typeSelects.last();
    await expect(lastTypeSelect).toHaveValue('Syrup');

    // Assert the amount input dynamically shows the "ml" suffix
    const unitLabels = page.locator('[data-testid="billing-unit-label"]').or(page.locator('span:has-text("ml")'));
    await expect(unitLabels.last()).toHaveText(/ml/i);

    // Change Type to "Medicine"; assert the suffix changes to "qty"
    await lastTypeSelect.selectOption('Medicine');
    const unitLabelQty = page.locator('[data-testid="billing-unit-label"]').or(page.locator('span:has-text("qty")'));
    await expect(unitLabelQty.last()).toHaveText(/qty/i);

    // 4. Click "Save Visit" and expect a success toast
    const saveVisitBtn = page.locator('[data-testid="save-visit-btn"]').or(page.getByRole('button', { name: /Save Visit/i })).first();
    await saveVisitBtn.click();

    // Verify success toast appears
    await expect(page.getByText(/Saved|Clinical Visit Saved|Recorded visit/i)).toBeVisible();
  });
});
