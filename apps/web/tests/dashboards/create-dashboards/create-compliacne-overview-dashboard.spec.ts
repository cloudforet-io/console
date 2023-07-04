import { expect, test } from '@playwright/test';

test.describe('Create Compliance Overview Dashboard', () => {
    test('Create entire Workspace dashboard', async ({ page }) => {
        page.goto('/');

        await test.step('1. Go to Create New Dashboard page', async () => {
            //
            await page.locator('.gnb-menu .menu-button').first().click();
            const createNewDashboardButton = await page.locator('.g-n-b-dashboard-menu .sub-menu').nth(1).locator('.gnb-sub-contents');
            await createNewDashboardButton.click();
            await expect(page).toHaveURL('/dashboards/create');
        });

        await test.step('2. Select Scope and Viewers in Step 1', async () => {
            // choose dashboard scope "entire workspace"
            const dashboardScope = await page.locator('.dashboard-scope-form .dashboard-scope-wrapper .p-radio-group');
            await dashboardScope.locator('.p-radio').first().click();

            // choose dashboard viewer "public"
            const dashboardViewer = await page.locator('.dashboard-viewers-form .dashboard-viewers-wrapper .p-radio-group');
            await dashboardViewer.locator('.p-radio').first().click();

            // click continue button
            const continueButton = await page.locator('.button-area .p-button').nth(1);
            await continueButton.click();
            await expect(page.locator('.dashboard-create-header > .step')).toContainText('2/2');
        });

        const dashboardName = `playwright-${Date()}`;

        await test.step('3. Select Template (Compliance Overview)', async () => {
            // choose template "Compliance Overview"
            const complianceOverviewTemplate = await page.locator('.default-dashboard-board .p-board-item').nth(2);
            await expect(complianceOverviewTemplate).toContainText('Compliance Overview');
            await complianceOverviewTemplate.click();

            // click create button
            const createDashboardButton = await page.locator('.button-area .p-button').nth(1);
            await createDashboardButton.click();

            await expect(page).toHaveURL('/dashboards/workspace/customize');
        });

        await test.step('4. Check default variables', async () => {
            const variables = await page.locator('.dashboard-variables-select-dropdown .dashboard-variable-dropdown');
            const labelList: string[] = [];
            for (const widgetElement of await variables.all()) {
                const variableName = await widgetElement.locator('.variable-label').innerText();
                labelList.push(variableName);
            }
            expect(labelList).toEqual([
                'Project', 'Provider', 'Region', 'Compliance Type', 'AWS Account ID (Asset)',
            ]);
        });

        await test.step('5. Check default widget list', async () => {
            const widgetList = await page.locator('.draggable-wrapper .draggable-item');
            const widgetNameList: string[] = [];
            for (const widgetElement of await widgetList.all()) {
                const widgetName = await widgetElement.locator('.text').innerText();
                widgetNameList.push(widgetName);
            }
            expect(widgetNameList).toEqual([
                'Compliance Check Status',
                'Total Failure and Severity',
                'Count of Pass and Fail Findings by Region',
                'Count of Fail Findings by Service',
                'Trend of Pass and Fail Findings by Service',
                'Severity Status by Service',
            ]);
        });

        await test.step('6. Enter and create a dashboard name', async () => {
            await page.getByPlaceholder('Compliance Overview').click();
            await page.getByPlaceholder('Compliance Overview').fill(`${'Compliance Overview'}-${dashboardName}`);
            await page.getByRole('button', { name: 'Save' }).click();
            await expect(page).toHaveURL(/dashboards\/workspace\/detail/);
        });

        await test.step('7. Check the created dashboard', async () => {
            const locatorScope = await page.locator('.p-breadcrumbs > span:nth-child(2) .link');
            const locatorName = await page.locator('.lnb-menu-item .selected .text');

            await expect(locatorScope).toContainText(' Workspace ');
            await expect(locatorName).toContainText(dashboardName);
        });

        await test.step('8. Delete dashboard', async () => {
            const deleteButton = await page.locator('.dashboard-title-icon-buttons-wrapper .delete-button');
            await deleteButton.click();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await expect(page).toHaveURL(/dashboards\/all/);
        });
    });
});
