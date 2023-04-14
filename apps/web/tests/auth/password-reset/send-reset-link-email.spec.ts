import { test, expect } from '@playwright/test';

test.describe('Send Reset Link Email', () => {
    let page;


    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();

        await page.goto('/sign-in');
        await expect(page).toHaveURL('/sign-in');
        const routerLink = await page.waitForSelector('#reset-pw-button');
        await routerLink.click();
        await page.waitForNavigation();
        await expect(page).toHaveURL('/find-password?status=find');
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Back to sign-in', async () => {
        await test.step('1. Back to sign-in', async () => {
            await page.getByRole('link', { name: 'Back to sign-in' }).click();
            await expect(page).toHaveURL('/sign-in/');
        });
    });

    test('Success sending email', async () => {
        await test.step('1. Enter userId and send', async () => {
            const locatorName = page.locator('.validation-email-page .contents_wrapper .done .status-title');

            await page.getByPlaceholder('E-mail Address').click();
            await page.getByPlaceholder('E-mail Address').fill(process.env.SUCCESS_ID as string);
            await page.getByRole('button', { name: 'Send Password Reset Email' }).click();
            await expect(locatorName).toContainText('Password reset email sent');
        });

        await test.step('2. Open collapsible toggle', async () => {
            await page.getByText('Didn\'t receive an email?').click();
        });

        await test.step('3. Click go back to console button', async () => {
            await page.getByRole('button', { name: 'Go back to Console' }).click();
            await expect(page).toHaveURL('/sign-in/');
        });
    });

    test('Failed sending email', async () => {
        await test.step('1. Enter userId and send', async () => {
            const locatorName = page.locator('.validation-email-page .contents_wrapper .failed .status-title');

            await page.getByPlaceholder('E-mail Address').click();
            await page.getByPlaceholder('E-mail Address').fill(process.env.FAILED_ID as string);
            await page.getByRole('button', { name: 'Send Password Reset Email' }).click();
            await expect(locatorName).toContainText('Unable to reset password');
        });

        await test.step('2. Go back to previous step', async () => {
            await page.getByRole('link', { name: 'Go Back' }).click();
            await expect(page).toHaveURL('/find-password?status=find');
        });
    });
});
