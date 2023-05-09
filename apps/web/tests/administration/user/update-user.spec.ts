import { test, expect } from '@playwright/test';

test.describe('Update User - Local', () => {
    test('Update User', async ({ page }) => {
        await test.step('1. Go to administration page', async () => {
            await page.goto('/administration/iam/user');

            const locatorName = page.locator('.p-heading.heading-main>.heading-wrapper>h2.has-right');
            await expect(locatorName).toContainText('User');
        });

        await test.step('2. Click update user', async () => {
            await page.getByPlaceholder('Search', { exact: true }).click();
            await page.getByPlaceholder('Search', { exact: true }).fill(process.env.NEW_USER_ID as string);
            await page.getByPlaceholder('Search', { exact: true }).press('Enter');
            await page.locator('tr:nth-child(1) > .select-checkbox').click();
            await page.getByRole('button', { name: 'Action' }).click();
            await page.locator('span').filter({ hasText: 'Update' }).nth(1).click();
        });

        const verificationStatus = page.locator('.notification-email-form-wrapper .input-form-view .p-button.send-mail-button');

        if (verificationStatus) {
            await test.step('3. Check disabled send user a password reset link', async () => {
                await page.waitForLoadState('networkidle');

                const locatorName = page.locator('.p-radio-group.vertical .p-radio:nth-child(2) span');
                const classAttribute = await locatorName.getAttribute('class');
                await expect(classAttribute).toContain('disabled');
            });

            await test.step('3-1. Force verify notification email', async () => {
                await page.getByRole('article').getByRole('button', { name: 'Verify' }).click();

                const badge = page.locator('.p-badge');
                await expect(badge).toContainText('Verify');
            });
        }

        await test.step('4. Click send user a password reset link', async () => {
            await page.getByText('Send user a password reset link').click();

            const locatorName = page.locator('.password-form-wrapper .password-form-view .input-form .password input');
            await expect(locatorName).toBeDisabled();
        });

        await test.step('5. Click set password manually', async () => {
            const passwordInput = page.locator('.password-form-wrapper .password-form-view .input-form .password input');
            const passwordConfirmInput = page.locator('.password-form-wrapper .password-form-view .input-form .password-check input');

            await page.getByText('Set password manually').click();
            await passwordInput.click();
            await passwordInput.fill(process.env.NEW_PASSWORD as string);
            await passwordConfirmInput.click();
            await passwordConfirmInput.fill(process.env.NEW_PASSWORD as string);
        });

        await test.step('6. Click confirm button', async () => {
            await page.getByRole('button', { name: 'Confirm' }).click();
        });
    });
});
