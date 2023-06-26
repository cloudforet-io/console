import { expect, test } from '@playwright/test';

test.describe('Single Project Dashboard', () => {
    test('Create single project dashboard', async ({ page }) => {
        page.goto('/');
        await test.step('1. Go to Create New Dashboard page', async () => {
            await page.getByText('Dashboards', { exact: true }).click();
            await page.getByRole('link', { name: 'Create New Dashboard' }).click();
        });

        await test.step('2. Select Scope and Viewers in Step 1', async () => {
            await page.getByText(' Single Project ', { exact: true }).click();
            await page.getByText('Select Project').click();
            await page.getByText('SpaceONE', { exact: true }).click();
            await page.locator('span > .p-radio > .radio-icon').first().click();
            await page.getByText('Public', { exact: true }).click();
            await page.getByRole('button', { name: 'Continue' }).click();
            await expect(page.locator('.dashboard-create-header > .step')).toContainText('Step 2/2');
        });

        const dashboardName = `playwright-${Date()}`;
        const selectedTemplateName = await page.locator('.default-dashboard-board .p-board-item').first().locator('.dashboard-name').innerText();

        await test.step('3. Select Template (Default Dashboard)', async () => {
            // Todo: to be added
            // await expect('').not.toContainText(' Workspace ');
            await page.locator('.default-dashboard-board .p-board-item').first().click();
            await page.getByRole('button', { name: 'Create New Dashboard' }).click();
            await expect(page).toHaveURL('/dashboards/project/customize');
        });

        await test.step('4. Enter and create a dashboard name', async () => {
            await page.getByPlaceholder(selectedTemplateName).click();
            await page.getByPlaceholder(selectedTemplateName).fill(`${selectedTemplateName}-${dashboardName}`);
            await page.getByRole('button', { name: 'Save' }).click();
            await expect(page).toHaveURL(/dashboards\/project\/detail/);
        });

        await test.step('5. Check the created dashboard', async () => {
            const locatorScope = page.locator('.p-breadcrumbs > span:nth-child(2) .link');
            const locatorName = page.locator('.lnb-menu-item .selected .text');

            await expect(locatorScope).toContainText(' Project ');
            await expect(locatorName).toContainText(dashboardName);

            // Todo: to be added
            // await expect(locatorName).toContainText('public');
        });

        await test.step('6. Delete dashboard', async () => {
            const deleteButton = await page.locator('.dashboard-title-icon-buttons-wrapper .delete-button');
            await deleteButton.click();
            await page.getByRole('button', { name: 'Confirm' }).click();
        });
    });
});
