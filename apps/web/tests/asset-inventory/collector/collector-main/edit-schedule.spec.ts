import { test, expect } from '@playwright/test';

test.describe('Edit Schedule', () => {
    let page;

    /* Init */
    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    /* Test - The test must start with the schedule unset. */
    test('Edit collector schedule', async () => {
        await test.step('1. Go to collector page', async () => {
            await page.goto('/asset-inventory/collector');
            const pageTitleName = page.locator('.heading-wrapper>h2.has-right>span.title');
            await expect(pageTitleName).toContainText('Collector');
        });

        await test.step('2. Click toggle button for schedule on/off', async () => {
            const toggleButton = page.locator('.collector-lists>div:last-child .p-toggle-button');
            const toggleLabel = page.locator('.collector-lists>div:last-child .p-toggle-button .state-text');

            await toggleButton.waitFor({ state: 'visible', timeout: 5000 });
            const toggleClassAttribute = await toggleButton.getAttribute('class');
            const hasActiveClass = toggleClassAttribute.includes('toggle-active');

            if (hasActiveClass) {
                await expect(toggleLabel).toContainText('ON');
            } else {
                await expect(toggleLabel).toContainText('OFF');

                const noScheduleStatus = page.locator('.collector-lists>div:last-child .collector-current-status .label-description .description-view');
                await noScheduleStatus.waitFor({ state: 'visible', timeout: 5000 });

                const classAttribute = await noScheduleStatus.getAttribute('class');
                const hasSpinClass = classAttribute.includes('no-schedule');
                await expect(hasSpinClass).toBeTruthy();

                await toggleButton.first().click();
            }
        });

        await test.step('3. Click edit schedule button', async () => {
            const editScheduleButton = page.locator('.collector-lists>div:last-child .schedule-button');
            await editScheduleButton.first().click();
        });

        await test.step('4. Setting schedule time', async () => {
            const firstTimeBlock = page.locator('.collector-schedule-modal .hourly-schedule-wrapper .time-block:first-child');
            const lastTimeBlock = page.locator('.collector-schedule-modal .hourly-schedule-wrapper .time-block:last-child');
            await firstTimeBlock.first().click();
            await lastTimeBlock.first().click();

            const confirmButton = page.locator('.collector-schedule-modal .confirm-button');
            await confirmButton.first().click();
        });

        await test.step('5. Check the Set Schedule', async () => {
            const schedule = page.locator('.collector-lists>div:last-child .collector-current-status .label-description>div>div');

            await schedule.waitFor({ state: 'visible', timeout: 5000 });
            const classAttribute = await schedule.getAttribute('class');
            const hasSetScheduleClass = classAttribute.includes('scheduled');
            await expect(hasSetScheduleClass).toBeTruthy();
        });
    });
});
