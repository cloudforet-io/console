import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
setup('Authenticate', async ({ page }) => {
    page.goto('/');
    await page.getByPlaceholder('User ID').click();
    await page.getByPlaceholder('User ID').fill(process.env.USERNAME as string);
    await page.getByPlaceholder('User ID').press('Tab');
    await page.getByPlaceholder('Password').fill(process.env.PASSWORD as string);
    const navigationPromise = page.waitForNavigation();
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await navigationPromise;
    await expect(page).toHaveURL(/home-dashboard/);

    await page.context().storageState({ path: authFile });
});
