import { expect, test, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
setup('Authenticate', async ({ page }) => {
    page.goto('/');

    await test.step('Enter user information', async () => {
        await page.getByPlaceholder('User ID').click();
        await page.getByPlaceholder('User ID').fill(process.env.USERNAME as string);
        await page.getByPlaceholder('User ID').press('Tab');
        await page.getByPlaceholder('Password').fill(process.env.PASSWORD as string);
    });

    await test.step('Click the sign in button', async () => {
        const navigationPromise = page.waitForNavigation();
        await page.getByRole('button', { name: 'Sign in', exact: true }).click();
        await navigationPromise;
        await expect(page).toHaveURL(/home-dashboard/);
    });

    await page.context().storageState({ path: authFile });
});
