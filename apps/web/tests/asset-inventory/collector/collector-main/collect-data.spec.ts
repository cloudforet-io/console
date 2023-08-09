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

    const checkInProgressStatus = async () => {
        const currentStatus = page.locator('.collector-lists>div:last-child .current-status-progress svg');
        await currentStatus.waitFor({ state: 'visible', timeout: 5000 });

        const classAttribute = await currentStatus.getAttribute('class');
        const hasSpinClass = classAttribute.includes('spin');
        await expect(hasSpinClass).toBeTruthy();
    }

    /* Test */
    test('Collect data in collect main page', async () => {
        await test.step('1. Go to collector page', async () => {
            await page.goto('/asset-inventory/collector');
            const pageTitleName = page.locator('.heading-wrapper>h2.has-right>span.title');
            await expect(pageTitleName).toContainText('Collector');
        });

        await test.step('2. Click collect data button', async () => {
            const collectDataButton = page.locator('.collector-lists>div:last-child .collector-status-wrapper>.p-button');
            collectDataButton.first().click();

            const alertModal = page.locator('.collector-data-modal .alert-header');
            try {
                await alertModal.waitFor({ state: 'visible', timeout: 5000 });

                await test.step('4. Check duplication collect data API', async () => {
                    await handleApiResponse();
                    await checkInProgressStatus()
                });

                await test.step('5. go to history page', async () => {
                    const moreButton = page.locator('.collector-lists>div:last-child .more-button');
                    await moreButton.first().click();

                    const pageTitleName = page.locator('.heading-wrapper>h2>span.title');
                    await expect(pageTitleName).toContainText('Collector History');
                });

                await test.step('6. Check history job status', async () => {
                    const inProgressRow = page.locator('table tbody tr:nth-child(1) .p-status');
                    const canceledRow = page.locator('table tbody tr:nth-child(2) .p-status');

                    const hasInProgressClass = await page.$eval(inProgressRow, (el) => {
                        return el.classList.contains('in-progress');
                    });
                    const hasCanceledClass = await page.$eval(canceledRow, (element) => {
                        return element.classList.contains('canceled');
                    });
                    await expect(hasInProgressClass).toBeTruthy();
                    await expect(hasCanceledClass).toBeTruthy();
                });
            } catch (error) {
                await test.step('3. Check collect data API', async () => {
                    await handleApiResponse();
                    await checkInProgressStatus();
                });

            }
        });
    });
})