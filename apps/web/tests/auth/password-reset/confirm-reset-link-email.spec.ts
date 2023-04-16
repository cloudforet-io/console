import { test, expect } from '@playwright/test';

test.describe('Confirm Reset Link Email', () => {
    test('Reset password', async ({ page }) => {
        await test.step('1. Go to reset reset password page', async () => {
            const locatorName = page.locator('.password-page .contents-wrapper .headline-wrapper .title');

            await page.goto(`/reset-password?sso_access_token=${process.env.ACCESS_TOKEN as string}`);
            await expect(locatorName).toContainText('Reset Password');
        });

        await test.step('2. Enter password', async () => {
            await page.getByPlaceholder('Password', { exact: true }).click();
            await page.getByPlaceholder('Password', { exact: true }).fill(process.env.RESET_PASSWORD as string);
        });

        await test.step('3. Enter confirm password', async () => {
            await page.getByPlaceholder('Confirm Password').click();
            await page.getByPlaceholder('Confirm Password').fill(process.env.CONFIRM_RESET_PASSWORD as string);
        });

        await test.step('4. Click reset password button', async () => {
            await page.getByRole('button', { name: 'Reset Password' }).click();
        });
    });

    test('Invalid link', async ({ page }) => {
        await test.step('1. Check invalid link', async () => {
            const locatorName = page.locator('.password-page .contents-wrapper .headline-wrapper .title');

            await page.goto('/reset-password');
            await expect(locatorName).toContainText('The link is invalid');
        });
    });
});
