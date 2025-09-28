import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
    resetServiceDirectoryMocks,
    setupServiceDirectoryMocks,
    type ServiceDirectoryMockOptions,
} from './serviceDirectoryMocks';

async function openServicesDashboard(page: Page, options?: ServiceDirectoryMockOptions) {
  const services = await setupServiceDirectoryMocks(page, options);
  await page.goto('/');

  const continueButton = page.getByRole('button', { name: /continue/i });
  await continueButton.first().click({ timeout: 15_000 }).catch(() => {});

  const skipButton = page.getByRole('button', { name: /skip for now/i });
  await skipButton.first().click({ timeout: 15_000 }).catch(() => {});

  const servicesTab = page.getByRole('button', { name: /services/i });
  await expect(servicesTab).toBeVisible({ timeout: 15_000 });
  await servicesTab.click();

  return services;
}

test.afterEach(async ({ page }) => {
  await resetServiceDirectoryMocks(page);
});

test('shows curated services when backend is available', async ({ page }) => {
  const services = await openServicesDashboard(page);

  await expect(page.getByText('Connected to Chennai services backend')).toBeVisible();
  await expect(page.getByText(`Showing ${services.length} of ${services.length} providers`)).toBeVisible();

  for (const service of services) {
    await expect(page.getByRole('heading', { name: service.name })).toBeVisible();
  }
});

test('filters services by category using the controls', async ({ page }) => {
  await openServicesDashboard(page);

  await page.getByRole('combobox', { name: 'Category' }).click();
  await page.getByRole('option', { name: 'Food & Beverages' }).click();

  await expect(page.getByRole('heading', { name: 'T Nagar Home Chefs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Anna Nagar Electricians' })).not.toBeVisible();
});

test('books a service and shows confirmation toast', async ({ page }) => {
  await openServicesDashboard(page, {
    booking: {
      message: 'Your booking is confirmed!'
    },
  });

  await page.getByRole('button', { name: 'Book slot' }).first().click();

  const bookingDialog = page.getByRole('dialog');
  await expect(bookingDialog).toBeVisible();

  const bookingInputs = bookingDialog.getByRole('textbox');
  await bookingInputs.nth(0).fill('Vaishnavi Tester');
  await bookingInputs.nth(1).fill('9876543210');
  await bookingInputs.nth(2).fill('Tomorrow 10 AM');

  await page.getByRole('button', { name: 'Book' }).click();

  await expect(page.getByText('Your booking is confirmed!')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden();
});
