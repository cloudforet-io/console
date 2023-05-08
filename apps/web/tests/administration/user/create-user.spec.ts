import { test, expect } from '@playwright/test';

test.describe('Create User - Local', () => {
    test('Create User', async ({ page }) => {
        await test.step('1. Go to administration page', async () => {
            await page.goto('/administration/iam/user');

            const locatorName = page.locator('.p-heading.heading-main>.heading-wrapper>h2.has-right');
            await expect(locatorName).toContainText('User');
        });

        await test.step('2. Click add user', async () => {
            await page.getByRole('button', { name: 'Add' }).click();

            const locatorName = page.locator('.p-button-modal .modal-content .header .modal-header');
            await expect(locatorName).toContainText('Add User');
        });

        await test.step('3. Click local tab and enter user id', async () => {
            await page.getByRole('button', { name: 'Local' }).click();

            const locatorName = page.locator('.user-info-form-wrapper .id-input-form .text-input input');
            await locatorName.click();
            await locatorName.fill(process.env.NEW_USER_ID as string);
            await page.getByRole('button', { name: 'Check ID' }).click();
        });

        await test.step('4. Check same with notification email', async () => {
            const userIdInput = page.locator('.user-info-form-wrapper .id-input-form .text-input input');
            const userIdValue = await userIdInput.inputValue();

            const locatorName = page.locator('.notification-email-form-wrapper .text-input input');
            await expect(locatorName).toHaveValue(userIdValue);
        });

        await test.step('5. Click send user a password reset link', async () => {
            const locatorName = page.locator('.password-form-wrapper .password-form-view .input-form .password input');
            await expect(locatorName).toBeDisabled();
        });

        await test.step('6. Click set password manually', async () => {
            const passwordInput = page.locator('.password-form-wrapper .password-form-view .input-form .password input');
            const passwordConfirmInput = page.locator('.password-form-wrapper .password-form-view .input-form .password-check input');

            await page.getByText('Set password manually').click();
            await passwordInput.click();
            await passwordInput.fill(process.env.PASSWORD as string);
            await passwordConfirmInput.click();
            await passwordConfirmInput.fill(process.env.PASSWORD as string);
        });

        await test.step('7. Click confirm button', async () => {
            await page.getByRole('button', { name: 'Confirm' }).click();
        });
    });
});
