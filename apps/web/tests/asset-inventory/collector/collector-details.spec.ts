import { test, expect } from '@playwright/test';

const IN_PROGRESS_SELECTOR = '.popper .label-description .current-status-progress';
const waitForApiResponseAfterCollectData = async (page) => {
    // wait for collect api to be called
    const collectDataResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/collect`);
    await expect(collectDataResponse.status()).toBe(200);

    // wait for the job list api to be called which is polled every 5 seconds
    const jobListResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/job/list`);
    await expect(jobListResponse.status()).toBe(200);
}

const checkIfStatusIsInProgress = async (page) => {
    // click on the status button
    await page.locator('button.status-button').click();

    // check if the status is in progress
    await expect(await page.locator(IN_PROGRESS_SELECTOR)).toBeVisible();
}

const restartAndCheckStatus = async (page) => {
    // wait for the re-start modal to be visible
    await page.getByText('Collecting is still in progress. Do you want to cancel and re-start it?').waitFor();

    // click the [Re-Start] button
    await page.getByRole('button', { name: 'Re-Start', exact: true }).click();

    await waitForApiResponseAfterCollectData(page);

    await checkIfStatusIsInProgress(page);

    // check if the last job icon shows 'canceled' status
    await expect(await page.locator('.recent-collector-job-list .collector-job-status-icon .icon').last()).toHaveClass(/canceled/);
}

test.describe('Collector Details', () => {
    test('Collect data for all accounts', async ({ page }) => {
        await test.step('1. Go to collector main page', async () => {
            await page.goto('/asset-inventory/collector');
            // wait for the page to load the data
            await page.waitForResponse(`${process.env.APIURL_V2 as string}/inventory/job/analyze`);
            // check if the page is loaded
            await expect(await page.getByRole('heading', { name: 'Collector' })).toBeVisible();
        });

        const COLLECTOR_INDEX = 0;
        await test.step('2. Click on the first collector and go to the details page', async () => {
            // get the name of the first collector
            const collectorName = await page.locator('.collector-content-item .collector-item-name').nth(COLLECTOR_INDEX).textContent() ?? undefined;

            // click on the first collector and wait for navigation to the collector details page
            const navigationPromise = page.waitForNavigation();
            const items = await page.locator('.collector-content-item').nth(COLLECTOR_INDEX).click();
            await navigationPromise;

            // check if the url is correct and the collector name is visible
            await expect(page).toHaveURL(/asset-inventory\/collector\/collector-*/);
            await expect(await page.getByRole('heading', { name: collectorName })).toBeVisible();
        });

        let isInProgress = false;
        await test.step('3. Click on the collect data status button and check the status', async () => {
            // click on the status button
            await page.locator('button.status-button').click();

            const inProgressLocator = await page.locator(IN_PROGRESS_SELECTOR)
            const scheduledLocator = await page.locator('.popper .label-description .scheduled')
            const  noScheduleLocator = await page.locator('.popper .label-description .no-schedule')

            // check if one of the status is visible
            await expect(inProgressLocator.or(scheduledLocator).or(noScheduleLocator)).toBeVisible();

            // set the isInProgress flag
            isInProgress = await page.locator(IN_PROGRESS_SELECTOR).isVisible();

            // click the [Collect Data] button
            await page.locator('.collect-data-button').click();
        });

        // if the status is in progress
        if (isInProgress) {
            await test.step('4. Click on the [Re-Start] button and check the changed status is applied', async () => {
                await restartAndCheckStatus(page);
            });
        }
        // if the status is scheduled or no schedule
        else {
            await test.step('5. Click on the [Collect-Now] button and check the changed status is applied', async () => {
                // wait for the collect-now modal to be visible
                await page.getByText('Do you want to collect data now?').waitFor();

                // click the [Collect-Now] button
                await page.getByRole('button', { name: 'Collect Now', exact: true }).click();

                await waitForApiResponseAfterCollectData(page)

                await checkIfStatusIsInProgress(page);

                // click the [Collect Data] button and check the step 4
                await page.locator('.collect-data-button').click();
                await restartAndCheckStatus(page);
            });
        }


        await test.step('6. Go to the collector main page and check the status', async () => {
            // go to the collector main page
            await page.locator('.back-button').click();

            // wait for the page to load the data
            await page.waitForResponse(`${process.env.APIURL_V2 as string}/inventory/job/analyze`);

            // check if the status is in progress
            const currentStatus = await page.locator('.collector-content-item .collector-current-status').nth(COLLECTOR_INDEX).textContent();
            await expect(currentStatus).toContain('In-Progress');

        });
    });
});
