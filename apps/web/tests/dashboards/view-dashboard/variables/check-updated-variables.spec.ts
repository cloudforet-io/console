import { expect, test } from '@playwright/test';

test.describe('Check Updated Dashboard Variables', () => {
    test('Set value of dashboard variable in view page', async ({ page }) => {
        page.goto('/dashboards/all');

        await test.step('1. Create new dashboard', async () => {
            await page.getByRole('button', { name: 'Create' }).click();
            await page.getByRole('button', { name: 'Continue' }).click();
            await page.locator('.default-dashboard-board .p-board-item').first().click();
            await page.getByRole('button', { name: 'Create New Dashboard' }).click();

            await expect(page).toHaveURL('/dashboards/workspace/customize');

            await page.getByPlaceholder('Monthly Cost Summary').fill(`Dashboard Variable Test ${Date()}`);
            await page.getByRole('button', { name: 'Save' }).click();

            await expect(page).toHaveURL(/dashboards\/workspace\/detail\/domain-.*/);
        });

        await test.step('2. Select value of dashboard variable', async () => {
            await page.getByRole('button', { name: 'Region' }).click();
            await page.getByText('Asia Pacific (Mumbai) | ap-south-1').click();
            await expect(page.getByRole('button', { name: /Region*/ })).toHaveText(/.*Asia Pacific (Mumbai) | ap-south-1/);
            // check widget
            await page.evaluate(() => {
                const widget = document.querySelector('.cost-by-region');
                if (widget) widget.scrollIntoView();
            });
            await expect(page.locator('.cost-by-region table tbody tr:nth-child(1) td:nth-child(2)')).toHaveText('Asia Pacific (Mumbai)');
        });

        await test.step('3. Delete dashboard', async () => {
            await page.locator('.delete-button').click();
            await page.getByRole('button', { name: 'Confirm' }).click();

            await expect(page).toHaveURL('/dashboards/all');
        });
    });
});
