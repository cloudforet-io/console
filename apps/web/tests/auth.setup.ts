import { test, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
setup('Authenticate', async ({ page }) => {
    page.goto('/');

    await test.step('Enter user information', async () => {
        await page.getByPlaceholder('E-mail Address').click();
        await page.getByPlaceholder('E-mail Address').fill(process.env.USERNAME as string);
        await page.getByPlaceholder('E-mail Address').press('Tab');
        await page.getByPlaceholder('Password').fill(process.env.PASSWORD as string);
    });

    await test.step('Click the sign in button', async () => {
        await page.getByRole('button', { name: 'Sign in', exact: true }).click();
        await page.waitForLoadState('networkidle');
    });

    await page.context().storageState({ path: authFile });
});
