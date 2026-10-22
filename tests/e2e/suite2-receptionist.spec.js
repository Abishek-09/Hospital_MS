import { test, expect } from '@playwright/test';
import { seedUserAuth, seedPatients, clearStorage } from './helpers/seedStorage.js';

test.describe('Suite 2: User/Receptionist Flow (/user/*)', () => {

  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await seedUserAuth(page);
    await seedPatients(page);
  });

  test('Patient Registration (Strict Constraints): Only Name and Mobile Number exist with 10-digit validation', async ({ page }) => {
    await page.goto('/user/patients');

    // Click "Add Patient" / "Register New Patient" button
    const addPatientBtn = page.locator('[data-testid="add-patient-btn"]').or(page.getByRole('button', { name: /(Register New Patient|Add Patient)/i }));
    await expect(addPatientBtn).toBeVisible();
    await addPatientBtn.click();

    // Verify modal is open
    const modalForm = page.locator('form');
    await expect(modalForm).toBeVisible();

    // 1. Assert that ONLY "Name" and "Mobile Number" input fields exist
    const nameInput = page.locator('[data-testid="patient-name-input"]').or(page.getByPlaceholder(/Aarav Kumar/i));
    const phoneInput = page.locator('[data-testid="patient-phone-input"]').or(page.getByPlaceholder(/10-digit parent mobile/i));

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();

    // Assert that fields like DOB, Address, or Email are absent from the DOM
    await expect(page.locator('input[type="date"]')).toHaveCount(0);
    await expect(page.locator('input[name="dob"]')).toHaveCount(0);
    await expect(page.locator('input[name="address"]')).toHaveCount(0);
    await expect(page.locator('textarea[name="address"]')).toHaveCount(0);
    await expect(page.locator('input[type="email"]')).toHaveCount(0);
    await expect(page.locator('input[name="email"]')).toHaveCount(0);

    // 2. Test validation: Enter a 9-digit mobile number, expect an error message
    await nameInput.fill('Pranav Sivakumar');
    await phoneInput.fill('984012345'); // 9 digits only

    const submitBtn = page.locator('[data-testid="patient-submit-btn"]').or(page.getByRole('button', { name: /Save Patient/i }));
    await submitBtn.click();

    // Expect validation error
    const errorMsg = page.locator('[data-testid="phone-error-msg"]').or(page.getByText(/must be exactly 10 digits/i));
    await expect(errorMsg).toBeVisible();

    // 3. Enter a valid 10-digit number, expect success
    await phoneInput.fill('9840123456'); // 10 digits
    await submitBtn.click();

    // Form should close and patient should appear in directory table
    await expect(modalForm).toHaveCount(0);
    await expect(page.getByText('Pranav Sivakumar')).toBeVisible();
  });

  test('Visit Workspace (Read-Only Clinical): Receptionist sees Details & History, but Consultation, Rx, and Billing are NOT rendered', async ({ page }) => {
    await page.goto('/user/workspace');

    // Select a patient from switcher/search
    await expect(page.locator('[data-testid="patient-details-card"]').or(page.getByText(/previous visits/i))).toBeVisible();
    await expect(page.locator('[data-testid="past-medical-history-card"]').or(page.getByText(/Past Medical History/i))).toBeVisible();

    // Assert that "Clinical Consultation", "Prescription Builder", and "Billing Engine" components are NOT rendered
    await expect(page.locator('[data-testid="clinical-consultation-section"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="prescription-builder-section"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="billing-engine-section"]')).toHaveCount(0);
    
    await expect(page.getByText(/Current Clinical Consultation/i)).toHaveCount(0);
    await expect(page.getByText(/Prescription Builder/i)).toHaveCount(0);
    await expect(page.getByText(/Pediatric Vitals & Growth/i)).toHaveCount(0);
  });
});
