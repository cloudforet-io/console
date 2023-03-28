import { expect, test } from '@playwright/test';

test.describe('Create Dashboard', () => {
    test('새 대시보드 생성하기 - Entire Workspace / Single Project 대시보드', async ({ page }) => {
        page.goto('/');

        // Login
        await test.step('enter user information', async () => {
            await page.getByPlaceholder('User ID').click();
            await page.getByPlaceholder('User ID').fill(process.env.USERNAME as string);
            await page.getByPlaceholder('User ID').press('Tab');
            await page.getByPlaceholder('Password').fill(process.env.PASSWORD as string);

            // click the sign in button
            const navigationPromise = page.waitForNavigation();
            await page.getByRole('button', { name: 'Sign in', exact: true }).click();
            await navigationPromise;

            // go to the next page
            await expect(page).toHaveURL(/home-dashboard/);
        });

        // Create Dashboard - Scope
        await test.step('1.상단 GNB > Dashboards > Create New Dashboard 페이지 이동', async () => {
            await page.getByText('Dashboards', { exact: true }).click();
            await page.getByRole('link', { name: 'Create New Dashboard' }).click();
        });

        await test.step('2.Step1에서 Dashboard Scope 선택 후, Step2의 Existing Dashboards 리스트 확인', async () => {
            const locatorDashboardInfo = page.locator('.first-list-item .dashboard-info');

            // 2-1.Entire Workspace
            await page.getByText('Entire Workspace', { exact: true }).click();
            await page.getByRole('button', { name: 'Continue' }).click();
            await expect(locatorDashboardInfo).toContainText(' Workspace ');
            await page.getByRole('button', { name: ' Go to Back ' }).click();

            // 2-2.Single Project
            await page.getByText(' Single Project ', { exact: true }).click();
            await page.getByText('Select Project').click();
            await page.getByText('SpaceONE', { exact: true }).click();
            await page.locator('span > .p-radio > .radio-icon').first().click();
            await page.getByRole('button', { name: 'Continue' }).click();
            await expect(locatorDashboardInfo).not.toContainText(' Workspace ');
            await page.getByRole('button', { name: ' Go to Back ' }).click();
        });

        await test.step('3.Dashboard Scope 선택', async () => {
            await page.getByText('Entire Workspace', { exact: true }).click();
        });

        await test.step('4.Viewers Public / Private 선택', async () => {
            await page.getByText('Public').click();
        });

        await test.step('5.[Continue] 버튼 클릭', async () => {
            await page.getByRole('button', { name: 'Continue' }).click();
        });

        const dashboardName = `playwright-${Date()}`;
        const selectedTemplate = await page.locator('.default-dashboard-board .p-board-item').first().locator('.dashboard-name');
        const selectedTemplateName = await selectedTemplate.innerText();
        await test.step('6.템플릿(기존 대시보드) 선택', async () => {
            await selectedTemplate.click();
        });

        await test.step('7.[Create New Dashboard] 버튼 클릭', async () => {
            await page.getByRole('button', { name: 'Create New Dashboard' }).click();
        });

        await test.step('8.선택한 템플릿(기존 대시보드)이 맞는지 확인', async () => {
            await page.getByPlaceholder(selectedTemplateName).click();
        });

        await test.step('9.대시보드명 입력', async () => {
            await page.getByPlaceholder(selectedTemplateName).fill(`${selectedTemplateName}-${dashboardName}`);
        });

        await test.step('10.[Save] 버튼 클릭하여 저장', async () => {
            await page.getByRole('button', { name: 'Save' }).click();
        });

        await test.step('11.대시보드가 정상적으로 생성되어있는지 확인', async () => {
            const locatorScope = page.locator('.p-breadcrumbs > span:nth-child(2) .link');
            const locatorName = page.locator('.lnb-menu-item .selected .text');

            await expect(locatorScope).toContainText(' Workspace ');
            await expect(locatorName).toContainText(dashboardName);
            // await expect(locatorName).toContainText('public'); // Todo: to be added
        });
    });
});
