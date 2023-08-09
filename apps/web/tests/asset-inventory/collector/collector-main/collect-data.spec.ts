import { test, expect } from '@playwright/test';

test.describe('Collector Data', () => {
    let page;

    /* Init */
    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });


    /* API */
    const handleApiResponse = async () => {
        const confirmButton = page.locator('.collector-data-modal .modal-footer .confirm-button');
        await confirmButton.click();

        try {
            const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/collect`);
            await page.waitForLoadState('networkidle');
            expect(apiResponse.status()).toBe(200);
        } catch (error) {
            console.error('Error occurred:', error);
        }
    };

    const clickCollectDataButton = () => {
        const collectDataButton = page.locator('.collector-lists>div:nth-child(1) .collector-status-wrapper>.p-button');
        collectDataButton.click();
    }

    /* Test */
    test('Collect data in collect main page', async () => {
        const currentStatus = page.locator('.collector-lists>div:nth-child(1) .current-status-progress>span');

        await test.step('1. Go to collector page', async () => {
            await page.goto('/asset-inventory/collector');
            const pageTitleName = page.locator('.heading-wrapper>h2.has-right>span.title');
            await expect(pageTitleName).toContainText('Collector');
        });

        await test.step('2. Click collect data button', async () => {
            await clickCollectDataButton();

            const modalTitle = page.locator('.collector-data-modal .modal-header');
            if (modalTitle.textContent() === 'Do you want to collect data now?') {
                await handleApiResponse();

                await test.step('3. Check collect data API', async () => {
                    await expect(currentStatus).toContainText('In-Progress 0%');
                    await clickCollectDataButton();
                });
            } else {
                await handleApiResponse();

                await test.step('4. Check duplication collect data API', async () => {
                    await expect(currentStatus).toContainText('In-Progress 0%');
                });

                await test.step('5. go to history page', async () => {
                    const moreButton = page.locator('.collector-lists>div:nth-child(1) .more-button');
                    await moreButton.first().click();

                    const pageTitleName = page.locator('.heading-wrapper>h2>span.title');
                    await expect(pageTitleName).toContainText('Collector History');
                });

                await test.step('6. Check history job status', async () => {
                    const inProgressRow = page.locator('table tbody tr:nth-child(1) .p-status .text');
                    const canceledRow = page.locator('table tbody tr:nth-child(2) .p-status .text');

                    await expect(inProgressRow).toContainText('In-Progress');
                    await expect(canceledRow).toContainText('Canceled');
                });
            }
        });
    });
})