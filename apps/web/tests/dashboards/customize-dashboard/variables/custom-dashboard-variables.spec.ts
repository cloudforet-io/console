import { expect, test } from '@playwright/test';

test.describe('Custom Dashboard Variables', () => {
    test('Check/Uncheck custom dashboard variables in customize page', async ({ page }) => {
        page.goto('/dashboards/all');

        await test.step('1. Enter to create page', async () => {
            await page.getByRole('button', { name: 'Create' }).click();
            await page.getByRole('button', { name: 'Continue' }).click();
            await page.locator('.default-dashboard-board .p-board-item').first().click();
            await page.getByRole('button', { name: 'Create New Dashboard' }).click();
            await expect(page).toHaveURL('/dashboards/workspace/customize');
        });

        await test.step('2. Add custom dashboard variable', async () => {
            await test.step('2-1. Set dashboard name', async () => {
                await page.getByPlaceholder('Monthly Cost Summary').fill(`Dashboard Variable Test ${Date()}`);
            });

            await test.step('2-2. Add custom variable', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.getByRole('button', { name: 'Manage Variables' }).click();
                await expect(page).toHaveURL(/#manage-variables/);

                await page.getByRole('button', { name: 'Add Variable' }).click();
                await page.locator('.name-input input').fill('Custom Variable for test');

                const optionInput = page.locator('.option-input');
                await optionInput.getByPlaceholder('Key').fill('custom_value_for_test');
                await optionInput.getByPlaceholder('Label name').fill('Custom Value for Test');

                const saveButton = page.locator('.manage-wrapper').getByRole('button', { name: 'Save' });
                await saveButton.click();
                await page.getByRole('row', { name: /Custom Variable for test/ }).locator('.p-toggle-button').check();

                const backButton = page.locator('.page-contents > div > .heading-wrapper > .back-button > .p-button');
                await backButton.click();
                await expect(page).not.toHaveURL(/#manage-variables/);
            });
        });

        await test.step('3. Set value to Custom Variable', async () => {
            await page.getByRole('button', { name: 'Custom Variable for test' }).click();
            await page.getByText('Custom Value for Test', { exact: true }).click();

            const customVariableDropdown = page.getByRole('button', { name: /Custom Variable for test/ });
            await expect(customVariableDropdown).toHaveText(/Custom Value for Test/);
        });

        await test.step('4. Set custom variable to widget option', async () => {
            const widgetElements = page.locator('.widget-frame');
            // eslint-disable-next-line no-restricted-syntax
            for (const widgetElement of await widgetElements.all()) {
                // eslint-disable-next-line no-await-in-loop
                const widgetTitle = await widgetElement.locator('.widget-header').innerText();
                if (widgetTitle === 'Monthly Cost Overview' || widgetTitle === 'Cost Trend By Product') {
                    // open edit modal
                    // eslint-disable-next-line no-await-in-loop
                    const buttonCount = await widgetElement.locator('.edit-mode-cover button').count();
                    const editButton = widgetElement.locator(`.edit-mode-cover button:nth-child(${buttonCount - 1})`);
                    // eslint-disable-next-line no-await-in-loop
                    await editButton.click();
                    // eslint-disable-next-line no-await-in-loop
                    await page.waitForTimeout(1000);

                    // set custom variable to widget option
                    const projectDropdown = page.locator('.dashboard-widget-edit-modal').getByRole('button', { name: /Project/ });
                    // eslint-disable-next-line no-await-in-loop
                    await projectDropdown.click();
                    const customVariableContextMenu = page.locator('.dashboard-widget-edit-modal .p-context-menu:visible .p-context-menu-item')
                        .getByText(/Custom Variable for test/);
                    // eslint-disable-next-line no-await-in-loop
                    await customVariableContextMenu.click();

                    // save widget option
                    // eslint-disable-next-line no-await-in-loop
                    await page.getByRole('button', { name: 'Confirm' }).click();
                }
            }
        });

        await test.step('5. Delete custom variable from dashboard', async () => {
            await test.step('5-1. Uncheck custom variable', async () => {
                await page.getByRole('button', { name: 'More' }).click();
                await page.locator('.variables-menu .p-context-menu-item').getByText('Custom Variable for test').click();
            });

            await test.step('5-2. Show delete modal', async () => {
                await expect(page.locator('.delete-modal .modal-header')).toHaveText(/Not going to use this variable?/);

                const affectedWidgetWrapper = page.locator('.delete-modal .affected-widget-wrapper');
                await expect(affectedWidgetWrapper).toHaveText(/Monthly Cost Overview/);
                await expect(affectedWidgetWrapper).toHaveText(/Cost Trend By Product/);
            });

            await test.step('5-3. Confirm delete modal', async () => {
                await page.waitForTimeout(1000);
                await page.locator('.delete-modal').getByRole('button', { name: 'Confirm' }).click();
            });
        });

        await test.step('6. Check if options have been removed from the widget', async () => {
            const widgetElements = page.locator('.widget-frame');
            // eslint-disable-next-line no-restricted-syntax
            for (const widgetElement of await widgetElements.all()) {
                // eslint-disable-next-line no-await-in-loop
                const widgetTitle = await widgetElement.locator('.widget-header').innerText();
                if (widgetTitle === 'Monthly Cost Overview' || widgetTitle === 'Cost Trend By Product') {
                    // open edit modal
                    // eslint-disable-next-line no-await-in-loop
                    const buttonCount = await widgetElement.locator('.edit-mode-cover button').count();
                    // eslint-disable-next-line no-await-in-loop
                    await widgetElement.locator(`.edit-mode-cover button:nth-child(${buttonCount - 1})`).click();
                    // eslint-disable-next-line no-await-in-loop
                    await expect(page.locator('.dashboard-widget-edit-modal .widget-options-form')).not.toHaveText('Project');

                    // close edit modal
                    // eslint-disable-next-line no-await-in-loop
                    await page.locator('.dashboard-widget-edit-modal').getByRole('button', { name: 'Cancel' }).click();
                }
            }
        });

        await test.step('7. Save Dashboard', async () => {
            await page.getByRole('button', { name: 'Cancel' }).click(); // TODO: change to save after fix bug
            // await page.getByRole('button', { name: 'Save' }).click();
            await expect(page).toHaveURL(/dashboards\/workspace\/detail\/domain-.*/);
        });

        await test.step('8. Delete dashboard', async () => {
            await page.locator('.delete-button').click();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await expect(page).toHaveURL(/dashboards\/all/);
        });
    });
});
