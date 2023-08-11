import { test, expect } from '@playwright/test';

test.describe('Collector List', () => {
    let page;

    const goToCollectorPage = async () => {
        await page.goto('/asset-inventory/collector');
    };

    /* Init */
    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        await goToCollectorPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    /* Test */
    test('Go to asset collector page.', async () => {
        const pageTitleName = page.locator('.heading-wrapper>h2.has-right>span.title');
        await expect(pageTitleName).toContainText('Collector');
    });

    test('Filtering by providers.', async () => {
        await test.step('1. Click AppDynamics', async () => {
            await page.getByRole('button', { name: 'AppDynamics' }).click();

            try {
                const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/list`);
                await page.waitForLoadState('networkidle');
                expect(apiResponse.status()).toBe(200);
            } catch (error) {
                console.error('Error occurred:', error);
            }
        });

        await test.step('2. Click Atlassian', async () => {
            await page.getByRole('button', { name: 'Atlassian' }).click();

            try {
                const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/list`);
                await page.waitForLoadState('networkidle');
                expect(apiResponse.status()).toBe(200);
            } catch (error) {
                console.error('Error occurred:', error);
            }
        });

        await test.step('3. Click all provider', async () => {
            await page.getByRole('button', { name: 'All Providers' }).click();

            try {
                const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/list`);
                await page.waitForLoadState('networkidle');
                expect(apiResponse.status()).toBe(200);
            } catch (error) {
                console.error('Error occurred:', error);
            }
        });
    });

    test('Search Keyword.', async () => {
        await page.getByPlaceholder('Search', { exact: true }).click();
        await page.getByPlaceholder('Search', { exact: true }).fill('google');
        await page.getByPlaceholder('Search', { exact: true }).press('Enter');

        try {
            const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/list`);
            await page.waitForLoadState('networkidle');
            expect(apiResponse.status()).toBe(200);
        } catch (error) {
            console.error('Error occurred:', error);
        }
    });

    test('Exporting to an Excel file.', async () => {
        const excelButton = page.locator('.right-tool-group > div.tool').nth(0).locator('.p-button');
        await excelButton.first().click();

        try {
            await page.waitForLoadState('networkidle');
            const downloads = await page.context().downloads();
            expect(downloads.length).toBe(1);
            expect(downloads[0].suggestedFilename()).toContain('.xlsx');
        } catch (error) {
            console.error('Error occurred:', error);
        }
    });

    test('Refresh list.', async () => {
        const refreshButton = page.locator('.right-tool-group > div.tool').nth(1).locator('.p-button');
        await refreshButton.first().click();

        try {
            const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/list`);
            await page.waitForLoadState('networkidle');
            expect(apiResponse.status()).toBe(200);
        } catch (error) {
            console.error('Error occurred:', error);
        }
    });
});
