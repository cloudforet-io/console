import { test, expect } from '@playwright/test';

test.describe('Update User - Local', () => {
    test('Update User', async ({ page }) => {
        await test.step('1. Go to administration page', async () => {
            const locatorName = page.locator('.p-heading.heading-main>.heading-wrapper>h2.has-right');
            await page.goto('/administration/iam/user');
            await expect(locatorName).toContainText('User');
        });

        await test.step('2. Click update user', async () => {
            await page.getByRole('navigation').filter({ hasText: '1 / 4' }).getByRole('button').nth(1)
                .click();
            await page.getByRole('navigation').filter({ hasText: '2 / 4' }).getByRole('button').nth(1)
                .click();
            await page.getByRole('navigation').filter({ hasText: '3 / 4' }).getByRole('button').nth(1)
                .click();
            await page.locator('tr:nth-child(2) > .select-checkbox').click();
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

            await test.step('4. Send notification email', async () => {
                const locatorName = page.locator('.notification-email-form-wrapper .contents-wrapper');

                await page.waitForSelector('.notification-email-form-wrapper');
                await page.getByRole('button', { name: 'Send Verification Code' }).click();
                await page.waitForResponse(`${process.env.APIURL as string}/identity/user/verify-email`);
                await expect(locatorName).toContainText('A verification code has been sent to');
            });

            await test.step('5. Open collapsible toggle and re-send', async () => {
                const toggle = await page.waitForSelector('.p-collapsible-toggle');
                await toggle.click();
                await page.getByRole('button', { name: 'Send new code' }).click();
            });

            await test.step('6. Enter verification code', async () => {
                await page.locator('#verificationCode').getByRole('textbox').click();
                await page.locator('#verificationCode').getByRole('textbox').fill('123456');
                await page.getByRole('article').getByRole('button', { name: 'Verify' }).click();
            });
        } else {
            await test.step('3. Check enabled send user a password reset link', async () => {
                await page.getByText('Send user a password reset link').click();
            });
        }


        await test.step('7. Click send user a password reset link', async () => {
            await page.getByText('Send user a password reset link').click();
            const locatorName = page.locator('.password-form-wrapper .password-form-view .input-form .password input');
            await expect(locatorName).toBeDisabled();
        });

        await test.step('8. Click set password manually', async () => {
            const passwordInput = page.locator('.password-form-wrapper .password-form-view .input-form .password input');
            const passwordConfirmInput = page.locator('.password-form-wrapper .password-form-view .input-form .password-check input');

            await page.getByText('Set password manually').click();
            await passwordInput.click();
            await passwordInput.fill('Test@1234');
            await passwordConfirmInput.click();
            await passwordConfirmInput.fill('Test@1234');
        });

        await test.step('9. Click confirm button', async () => {
            await page.getByRole('button', { name: 'Confirm' }).click();
        });
    });
});
