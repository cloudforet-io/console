import { test, expect } from '@playwright/test';

test.describe('Login', () => {
    test('Local user sign in', async ({ page }) => {
        page.goto('/');

        await test.step('enter user information', async () => {
            await page.getByPlaceholder('User ID').click();
            await page.getByPlaceholder('User ID').fill(process.env.USERNAME as string);
            await page.getByPlaceholder('User ID').press('Tab');
            await page.getByPlaceholder('Password').fill(process.env.PASSWORD as string);
        });

        await test.step('click the sign in button', async () => {
            const navigationPromise = page.waitForNavigation();
            await page.getByRole('button', { name: 'Sign in', exact: true }).click();
            await navigationPromise;
        });

        await test.step('go to the next page', async () => {
            await expect(page).toHaveURL(/home-dashboard/);
        });
    });
});
