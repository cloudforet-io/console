import { test, expect } from '@playwright/test';

test.describe('Confirm Reset Link Email', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Reset password', async () => {
        await test.step('1. Go to reset reset password page', async () => {
            const locatorName = page.locator('.password-page .contents-wrapper .headline-wrapper .title');
            await page.goto(`/reset-password?sso_access_token=${process.env.ACCESS_TOKEN as string}`);
            await expect(locatorName).toContainText('Reset Password');
        });

        await test.step('2. Enter password', async () => {
            await page.getByPlaceholder('Password', { exact: true }).click();
            await page.getByPlaceholder('Password', { exact: true }).fill('Test@1234');
        });

        await test.step('3. Enter confirm password', async () => {
            await page.getByPlaceholder('Confirm Password').click();
            await page.getByPlaceholder('Confirm Password').fill('Test@1234');
        });

        await test.step('4. Click reset password button', async () => {
            const response = await page.waitForResponse(`${process.env.APIURL as string}/identity/user/update`);

            await page.getByRole('button', { name: 'Reset Password' }).click();

            expect(response.status()).toBe(200);
        });
    });

    test('Invalid link', async () => {
        await test.step('1. Check invalid link', async () => {
            const locatorName = page.locator('.password-page .contents-wrapper .headline-wrapper .title');
            await page.goto('/reset-password');
            await expect(locatorName).toContainText('The link is invalid');
        });
    });
});
