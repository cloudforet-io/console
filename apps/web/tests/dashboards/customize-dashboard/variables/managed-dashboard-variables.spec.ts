import { expect, test } from '@playwright/test';

test.describe('Managed Dashboard Variables', () => {
    test('Uncheck managed dashboard variables in customize page', async ({ page }) => {
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

        await test.step('2. Enter to customize page', async () => {
            await page.getByRole('button', { name: 'Customize' }).click();
            await expect(page).toHaveURL(/dashboards\/workspace\/customize/);
        });

        await test.step('3. Uncheck managed variables ("Region", "Service Account")', async () => {
            await page.getByRole('button', { name: 'More' }).click();
            await page.locator('.variables-menu .p-context-menu-item').getByText('Region').click();

            await page.getByRole('button', { name: 'More' }).click();
            await page.locator('.variables-menu .p-context-menu-item').getByText('Service Account').click();
        });

        await test.step('4. Check if options have been removed from the widget', async () => {
            const widgetElements = await page.locator('.widget-frame').all();
            for (const widgetElement of widgetElements) {
                // open edit modal
                const buttonCount = await widgetElement.locator('.edit-mode-cover button').count();
                await widgetElement.locator(`.edit-mode-cover button:nth-child(${buttonCount - 1})`).click();
                await expect(page.locator('.dashboard-widget-edit-modal .widget-options-form')).not.toHaveText('Region');
                await expect(page.locator('.dashboard-widget-edit-modal .widget-options-form')).not.toHaveText('Service Account');

                // close edit modal
                await page.locator('.dashboard-widget-edit-modal').getByRole('button', { name: 'Cancel' }).click();
            }
        });

        await test.step('5. Save dashboard', async () => {
            await page.getByRole('button', { name: 'Save' }).click();
        });

        await test.step('6. Delete dashboard', async () => {
            await page.getByRole('button', { name: 'Cancel' }).click();
            await page.locator('.delete-button').click();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await expect(page).toHaveURL(/dashboards\/all/);
        });
    });
});
