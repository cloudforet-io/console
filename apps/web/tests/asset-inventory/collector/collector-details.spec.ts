import { test, expect } from '@playwright/test';

test.describe('Collector Details', () => {
    test('Collect data for all accounts', async ({ page }) => {
        await test.step('1. Go to collector main page', async () => {
            await page.goto('/asset-inventory/collector');
            await expect(await page.getByRole('heading', { name: 'Collector' })).toBeVisible();
        });

        await test.step('2. Click on the first collector', async () => {
            const navigationPromise = page.waitForNavigation();
            // const collectorName = await page.locator('.collector-content-item-name').first().textContent();
            // console.debug(collectorName)
            const items = await page.locator('.collector-content-item')
            console.debug(items)
            await items.first().click();
            await navigationPromise;
            // await expect(page).toHaveURL(/asset-inventory\/collector\/collector-*/);
            // await expect(page.getByRole('heading', { name: 'Collector' })).toBeVisible();

        });
    });
});
