import { expect, test } from '@playwright/test';

test.describe('Manage Variables', () => {
    test('Manage Variables in View Dashboard', async ({ page }) => {
        page.goto('/dashboards/all');

        await test.step('1. Select a dashboard', async () => {
            await page.locator('.dashboard-board-list .p-board-item').first().click();
            await expect(page).toHaveURL(/detail/);
        });

        await test.step('2. Go to the Manage Variable Overlay', async () => {
            await page.locator('.dashboard-selectors .variable-more-button-dropdown').click();
            await page.getByText('Manage Variables', { exact: true }).click();
            await expect(page).toHaveURL(/#manage-variables/);
        });

        await test.step('3. Add Custom Variable', async () => {
            // Custom Varialbe Form Fields
            const nameField = page.locator('.p-field-group', { hasText: 'Name' });
            const selectionTypeField = page.locator('.p-field-group', { hasText: 'Selection Type' });
            const descriptionField = page.locator('.p-field-group', { hasText: 'Description' });
            const dataSourceField = page.locator('.p-field-group', { hasText: 'Data Source' });

            await test.step('Go to Variable Add form', async () => {
                await page.locator('.p-heading .p-button', { hasText: 'Add Variable' }).click();
                await expect(page.getByText('Add Variable')).toBeVisible();
            });

            // Enter Variable Base Fields : Name, Selection Type, Description
            await test.step('Enter Variable Base Fields', async () => {
                await nameField.locator('input').click();
                await nameField.locator('input').fill(`custom variable test - ${Date()}`);

                await selectionTypeField.locator('.p-select-dropdown').click();
                await page.locator('.p-context-menu').getByText('Multi select', { exact: true }).click();

                await descriptionField.locator('input').click();
                await descriptionField.locator('input').fill('test description');
            });

            // Enter Variable Data Source (aka Options)
            await test.step('Enter Variable Data Source', async () => {
                await dataSourceField.getByPlaceholder('Key').click();
                await dataSourceField.getByPlaceholder('Key').fill('data source option key 1');
                await dataSourceField.getByPlaceholder('Label name').click();
                await dataSourceField.getByPlaceholder('Label name').fill('data source option label 1');

                await dataSourceField.getByRole('button', { name: 'Add' }).click();
                await dataSourceField.getByPlaceholder('Key').nth(1).click();
                await dataSourceField.getByPlaceholder('Key').nth(1).fill('data source option key 1');
                await dataSourceField.getByPlaceholder('Label name').nth(1).click();
                await dataSourceField.getByPlaceholder('Label name').nth(1).fill('data source option label 1');

                await expect(page.locator('.button-wrapper').getByRole('button', { name: 'Save' })).toHaveClass('p-button primary md disabled');
            });

            // Check Data Source Duplicate Invalid By Save Button
            await test.step('Check Variable Data Source Duplicate Invalid', async () => {
                await dataSourceField.getByPlaceholder('Key').nth(1).click();
                await dataSourceField.getByPlaceholder('Key').nth(1).fill('data source option key 2');
                await dataSourceField.getByPlaceholder('Label name').nth(1).click();
                await dataSourceField.getByPlaceholder('Label name').nth(1).fill('data source option label 2');

                await expect(page.locator('.button-wrapper').getByRole('button', { name: 'Save' })).toHaveClass('p-button primary md');
            });

            await test.step('Save New Custom Variable and Check Use On', async () => {
                await page.locator('.button-wrapper').getByRole('button', { name: 'Save' }).click();

                // Check Variable Name and Use On
                await expect(page.locator('.p-data-table .table-container')).toContainText('custom variable test');
                await expect(page.locator('.p-data-table .table-container tr', { hasText: 'custom variable test' }).locator('.p-toggle-button input')).toBeChecked();
            });
        });

        await test.step('4. Go to the Dashboard Customize and Check Custom Variable Creation', async () => {
            // Close Manage Variable Overlay and Check Creation
            await page.locator('.dashboard-manage-variable-overay .p-heading', { hasText: 'Manage Variables' }).locator('button').click();
            await expect(page.getByRole('button', { name: 'custom variable test' })).toBeVisible();

            // Reopen Manage Variable Overlay
            await test.step('Go to the Manage Variable Overlay', async () => {
                await page.locator('.dashboard-selectors .variable-more-button-dropdown').click();
                await page.getByText('Manage Variables', { exact: true }).click();
                await expect(page).toHaveURL(/#manage-variables/);
            });
        });

        await test.step('5. Clone Custom Variable', async () => {
            await page.locator('.p-data-table .table-container tr', { hasText: 'custom variable test' }).locator('button').first().click();
            await expect(page.getByText('Add Variable')).toBeVisible();
        });

        await test.step('6. Check Entrance of Add Variable with Clone Data', async () => {
            // Custom Varialbe Form Fields
            const nameField = page.locator('.p-field-group', { hasText: 'Name' });
            const selectionTypeField = page.locator('.p-field-group', { hasText: 'Selection Type' });
            const descriptionField = page.locator('.p-field-group', { hasText: 'Description' });
            const dataSourceField = page.locator('.p-field-group', { hasText: 'Data Source' });

            await expect(nameField.locator('input')).toHaveValue(/Copy - custom variable test/);
            await expect(selectionTypeField.locator('.p-select-dropdown')).toHaveText(/Multi select/);
            await expect(descriptionField.locator('input')).toHaveValue(/test description/);
            await expect(dataSourceField.getByPlaceholder('Key').first()).toHaveValue(/data source option key 1/);
            await expect(dataSourceField.getByPlaceholder('Label name').first()).toHaveValue(/data source option label 1/);
            await expect(dataSourceField.getByPlaceholder('Key').nth(1)).toHaveValue(/data source option key 2/);
            await expect(dataSourceField.getByPlaceholder('Label name').nth(1)).toHaveValue(/data source option label 2/);

            // Save and Check Variable Name and Use On
            await page.locator('.button-wrapper').getByRole('button', { name: 'Save' }).click();
            await expect(page.locator('.p-data-table .table-container')).toContainText('Copy - custom variable test');
            await expect(page.locator('.p-data-table .table-container tr', { hasText: 'Copy - custom variable test' }).locator('.p-toggle-button input')).toBeChecked();
        });

        await test.step('7. Delete Custom Variables', async () => {
            // Delete Origin Custom Variable
            await page.locator('.p-data-table .table-container tr', { hasText: 'custom variable test' }).first().locator('button').last()
                .click();
            await expect(page.locator('.modal-wrapper')).toBeVisible();
            await page.locator('.modal-wrapper').getByRole('button', { name: 'Confirm' }).click();

            // Delete Cloned Custom Variable
            await page.locator('.p-data-table .table-container tr', { hasText: 'Copy - custom variable test' }).locator('button').last().click();
            await expect(page.locator('.modal-wrapper')).toBeVisible();
            await page.locator('.modal-wrapper').getByRole('button', { name: 'Confirm' }).click();
        });
    });
});
