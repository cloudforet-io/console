/* eslint-disable no-await-in-loop */
import { test, expect } from '@playwright/test';


// getRandomIndexExceptFirst: 1 ~ (count - 1)
const getRandomIndexExceptFirst = (count: number) => Math.floor(Math.random() * (count - 1)) + 1;

// getRandomIndexInRange: 0 ~ (count - 1)
const getRandomIndexInRange = (count: number) => Math.floor(Math.random() * count);

const checkApiCall = async (page: any, url: string) => {
    const response = await page.waitForResponse(`${process.env.APIURL as string}${url}`);
    await expect(response.status()).toBe(200);
    return response.json();
};

const formatDateTime = (dateTime: string) => {
    const [date, time] = dateTime.split('T');
    return `${date} ${time.split('.')[0]}`;
};


test.describe('Collector Create', () => {
    // for get-plugin-metadata api call [usually takes 1~2 minutes]
    test.setTimeout(180000);

    test('create collector(1): specific service account Included + schedule ON + Collect Now O', async ({ page }) => {
        await test.step('1. Access the Asset Inventory > Collector Page.', async () => {
            await page.goto('/asset-inventory/collector');
            await expect(await page.getByRole('heading', { name: 'Collector' })).toBeVisible();
        });

        await test.step('2. Click the [+Create] Button at the top > Verify Successful Move to Step 1/4.', async () => {
            await page.getByRole('button', { name: 'Create' }).click();
            await page.mainFrame().waitForURL('/asset-inventory/collector/create');
            await expect(page).toHaveURL('/asset-inventory/collector/create');
        });

        await test.step('3. Search for a keyword in the top search bar and confirm (Check API Call).', async () => {
            await page.getByPlaceholder('Search', { exact: true }).click();
            await page.getByPlaceholder('Search', { exact: true }).fill('cloud');
            await page.getByPlaceholder('Search', { exact: true }).press('Enter');
            await checkApiCall(page, '/repository/plugin/list');
        });

        await test.step('4. Confirm selection of a provider on the left side (Check API Call).', async () => {
            const providerRadioButtonCount = await page.locator('div.provider > div.p-radio-group.vertical > span').count();
            const randomIndex = getRandomIndexExceptFirst(providerRadioButtonCount);
            page.locator(`div.provider > div.p-radio-group.vertical > span:nth-child(${randomIndex + 1})`).click();
            await checkApiCall(page, '/repository/plugin/list');
        });

        await test.step('5. Confirm selection of a repository on the left side (Check API Call).', async () => {
            const repositoryRadioButtonCount = await page.locator('div.repository > div.p-radio-group.vertical > span').count();
            const randomIndex = getRandomIndexExceptFirst(repositoryRadioButtonCount);
            page.locator(`div.repository > div.p-radio-group.vertical > span:nth-child(${randomIndex + 1})`).click();
            await checkApiCall(page, '/repository/plugin/list');
        });

        await test.step('6. Click the [Select] Button for a specific plugin > Confirm Move to Step 2/4.', async () => {
            await page.locator('div.provider > div.p-radio-group.vertical > span:nth-child(1)').click();
            await page.locator('div.repository > div.p-radio-group.vertical > span:nth-child(1)').click();
            await page.waitForLoadState('networkidle');
            const collectorCount = await page.locator('div.plugin-card-list > div.plugin-card-item').count();
            const randomIndex = getRandomIndexInRange(collectorCount);
            await page.getByRole('button', { name: 'Select' }).nth(randomIndex).click();
            await expect(page.locator('p.step')).toContainText('Step 2');
        });

        await test.step('7. When [Select Other Plugin] is chosen, confirm Move to Step 1/4.', async () => {
            await page.getByRole('button', { name: 'Select Other Plugin' }).click();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await expect(page.locator('p.step')).toContainText('Step 1');
        });

        await test.step('8. Click the [Select] Button for the specific plugin again > Confirm Move to Step 2/4.', async () => {
            await checkApiCall(page, '/repository/plugin/list');
            const collectorCount = await page.locator('div.plugin-card-list div.plugin-card-item').count();
            const randomIndex = getRandomIndexInRange(collectorCount);
            await page.getByRole('button', { name: 'Select' }).nth(randomIndex).click();
            await expect(page.locator('p.step')).toContainText('Step 2');
        });

        let collectorTitle;
        let selectedPluginName = '';
        await test.step('9. Fill in the Name field > Select one Provider if applicable.', async () => {
            collectorTitle = `test collector-${new Date().getTime()}`;
            await page.locator('div.name-form > div.p-text-input').getByRole('textbox').fill(collectorTitle);
            const providerCount = await page.locator('div.multiple-provider-form > div.radio-container > div > span').count();
            if (providerCount) {
                const randomIndex = getRandomIndexInRange(providerCount);
                await page.locator('div.multiple-provider-form > div.radio-container > div > span').nth(randomIndex).click();
            }
            selectedPluginName = (await page.locator('div.plugin-data-contents > div > p.plugin-name').textContent() ?? '');
        });

        await test.step('10. Version - Auto Upgrade Switch Off.', async () => {
            await checkApiCall(page, '/repository/plugin/get-versions');
            await page.getByLabel('').click();
            await page.locator('div.collector-version-form.version-row > div.p-select-dropdown > button').click();
            const versionItemsCount = await page.locator('div.collector-version-form.version-row > div.p-select-dropdown > div > div.menu-container > span.p-context-menu-item').count();
            const randomIndex = getRandomIndexExceptFirst(versionItemsCount);
            await page.locator('div.collector-version-form.version-row > div.p-select-dropdown > div > div.menu-container > span').nth(randomIndex).click();
            await expect(page.locator('p.step')).toContainText('Step 2');
        });

        await test.step('11. Click the [+Add Tag] Button and enter one tag as follows', async () => {
            await page.getByRole('button', { name: 'Add Tags' }).click();
            await page.getByRole('button', { name: 'Add Tags' }).press('Tab');
            await page.getByPlaceholder('Key').fill('test_key');
            await page.getByPlaceholder('Key').press('Tab');
            await page.getByPlaceholder('Value').fill('test_value');
        });

        await test.step('12. If there are Additional Options, input or select fields randomly.', async () => {
            await page.getByRole('button', { name: 'Continue' }).click();
            // 14. Confirm the API call is made to get the plugin metadata.
            // description: api check was tried when accessing the page, so step14 should be executed first, so step12 was modified to try api check
            // Problem: 502 Bad Gateway and 504 Gateway Timeout sometimes occurs in get-plugin-metadata api call
            let res;
            try {
                res = await page.waitForResponse(`${process.env.APIURL_V2 as string}/plugin/plugin/get-plugin-metadata`);
                expect(res.status()).toBe(200);
            } catch (error) {
                await page.getByRole('button', { name: 'Reload' }).click();
                res = await page.waitForResponse(`${process.env.APIURL_V2 as string}/plugin/plugin/get-plugin-metadata`);
                expect(res.status()).toBe(200);
            }
            await expect(page.locator('p.step')).toContainText('Step 3');
        });

        const selectedServiceAccount:string[] = [];
        await test.step('13. Choose Attached Service Account > Specific Service Account(s).', async () => {
            await page.getByText('Specific Service Account').first().click();
            await page.getByText('Select', { exact: true }).first().click();
            await checkApiCall(page, '/add-ons/autocomplete/resource');
            const getServiceAccountCount = async () => page.locator('div.p-context-menu.dropdown-context-menu > div.menu-container > span.p-context-menu-item').count();
            let serviceAccountCount = await getServiceAccountCount();
            const randomIndex = getRandomIndexInRange(serviceAccountCount);
            if (serviceAccountCount > 1) {
                const firstServiceAccount = await page.locator('div.p-context-menu.dropdown-context-menu > div.menu-container > span.p-context-menu-item').nth(randomIndex);
                await firstServiceAccount.click();
                const firstServiceAccountText = await firstServiceAccount.textContent();
                if (firstServiceAccountText) selectedServiceAccount.push(firstServiceAccountText);
                serviceAccountCount = await getServiceAccountCount();
                let randomIndex2 = getRandomIndexInRange(serviceAccountCount);
                while (randomIndex === randomIndex2) {
                    randomIndex2 = getRandomIndexInRange(serviceAccountCount);
                }
                if (serviceAccountCount) {
                    const secondServiceAccount = await page.locator('div.p-context-menu.dropdown-context-menu > div.menu-container > span.p-context-menu-item').nth(randomIndex2);
                    await secondServiceAccount.click();
                    const secondServiceAccountText = await secondServiceAccount.textContent();
                    if (secondServiceAccountText) selectedServiceAccount.push(secondServiceAccountText);
                }
                await page.locator('.arrow-button > .p-i-icon').first().click();
            } else {
                await page.getByText('All').first().click();
            }
            await expect(page.locator('p.step')).toContainText('Step 3');
        });

        let selectedComplianceType:string;
        await test.step('15. If there are Additional Options, input or select fields randomly.', async () => {
            if (selectedPluginName.includes('Prowler Security Compliance Collector')) {
                const complianceType = await page.locator('div.collector-options-form-contents form > div:nth-child(2)');
                await complianceType.getByRole('button').first().click();
                const complianceTypeItemsCount = await complianceType.locator('span.p-context-menu-item').count();
                const randomIndex = getRandomIndexInRange(complianceTypeItemsCount);
                const selectedCompliance = await complianceType.locator('span.p-context-menu-item').nth(randomIndex);
                await selectedCompliance.textContent();
                selectedComplianceType = (await selectedCompliance.textContent() ?? '');
            }
        });
        await test.step('16. Click [Continue] Button to move to Step 4/4.', async () => {
            await page.getByRole('button', { name: 'Continue' }).click();
            await expect(page.locator('p.step')).toContainText('Step 4');
        });
        await test.step('17. Randomly select Hourly Schedule (2 time slots).', async () => {
            await page.getByLabel('').click();
            const randomIndex = getRandomIndexInRange(24);
            let randomIndex2 = 0;
            do {
                randomIndex2 = getRandomIndexInRange(24);
            } while (randomIndex === randomIndex2);
            await page.locator('div.hourly-schedule-wrapper > span').nth(randomIndex).click();
            await page.locator('div.hourly-schedule-wrapper > span').nth(randomIndex2).click();
        });
        await test.step('18. Click [Previous] Button to go back to Step 3/4.', async () => {
            await page.getByRole('button', { name: 'Previous' }).click();
            await expect(page.locator('p.step')).toContainText('Step 3');
        });
        await test.step('19. Click [Continue] Button again to move to Step 4/4. > After clicking [Create New Collector], verify creation status (Check API Call).', async () => {
            await page.getByRole('button', { name: 'Continue' }).click();
            await expect(page.locator('p.step')).toContainText('Step 4');
            await page.getByRole('button', { name: 'Create New Collector' }).click();
            await checkApiCall(page, '/inventory/collector/create');
        });

        let collector;
        await test.step('20. In the "Do you want to collect data now?" popup:Click [Collect Now] to confirm data collection initiation (Check API Call).', async () => {
            await page.getByRole('button', { name: 'Collect Now' }).click();
            collector = await checkApiCall(page, '/inventory/collector/collect');
        });
        await test.step('21. Automatically navigate to the detailed collector page (Check if the created collector ID is well-reflected in the URL and breadcrumbs).', async () => {
            const collectorId = collector?.collector_id;
            if (!collectorId) throw new Error('collectorId is not defined');
            await page.mainFrame().waitForURL(`/asset-inventory/collector/${collectorId}`);
            await expect(page.locator('div.header > div > span:nth-child(3) > span > a > span')).toContainText(collectorId);
        });

        let collectorData;
        let pluginData;
        await test.step('22. Confirm if the created collector name is correct.', async () => {
            collectorData = await checkApiCall(page, '/inventory/collector/get');
            pluginData = await checkApiCall(page, '/repository/plugin/get');

            const collectorPageTitle = await page.locator('div.p-heading.heading-main > div.heading-wrapper > h2 > span').textContent();
            await expect(collectorPageTitle).toContain(collectorTitle);
        });
        await test.step('23. Click the right-arrow next to the [Collect Data] Button at the top right to confirm In-Progress status (Data collection has started).', async () => {
            const collectorState = await page.locator('div.popper-content-wrapper > div > div > div.info-item > div > div > span').textContent();
            await expect(collectorState).toContain('In-Progress');
        });

        await test.step('24. Check the Base Information section [Plugin name / Version / Plugin ID / Created / Tag]', async () => {
            const pluginNameData:string = pluginData?.name;
            const pluginVersionData:string = collectorData?.plugin_info?.version;
            const pluginIdData:string = collectorData?.plugin_info?.plugin_id;
            const createdData:string = collectorData?.created_at;
            const tagData:object = collectorData?.tags;

            const pluginName = await page.locator('div.contents-wrapper > div.collector-plugin-info > div > div > p').textContent();
            const pluginVersion = await page.locator('div.collector-plugin-info > div > div > div > div:nth-child(2) > div.value').textContent();
            const pluginId = await page.locator('div.plugin-summary-cards > div:nth-child(1) > div.contents > span > span').textContent();
            const created = await page.locator('div.plugin-summary-cards > div:nth-child(2) > div.contents').textContent();
            const tags = await page.locator('div.contents-wrapper > div.collector-tags > div.tags-wrapper').locator('.p-tag');
            const tagsCount = await tags.count();
            const tagList:string[] = [];

            for (let i = 0; i < tagsCount; i++) {
                const tagElement = await tags.nth(i);
                const innerText = await tagElement.textContent();
                if (innerText) tagList.push(innerText);
            }
            const tagsObject = {};
            tagList.forEach((tag) => {
                const splitTag = tag.split(':');
                tagsObject[splitTag[0]] = splitTag[1];
            });

            const formattedString = formatDateTime(createdData);

            await expect(pluginName).toContain(pluginNameData);
            await expect(pluginVersion).toContain(pluginVersionData);
            await expect(pluginId).toContain(pluginIdData);
            await expect(created).toContain(formattedString);
            await expect(tagsObject).toEqual(tagData);
        });
        await test.step('25. Check the Schedule section: On status, verify selected time slots.', async () => {
            await expect(await page.locator('div.p-data-loader.collector-schedule-edit-form > div > div.data-wrapper > label > span')).toContainText('ON');
            const scheduleElement = await page.locator('div.p-field-group.hourly-schedule-field-group > div.hourly-schedule-wrapper.is-read-mode .active');
            const scheduleCount = await scheduleElement.count();
            const scheduleList:number[] = [];
            for (let i = 0; i < scheduleCount; i++) {
                const schedule = await scheduleElement.nth(i).textContent();
                scheduleList.push(Number(schedule));
            }
            await expect(scheduleList.sort()).toEqual((collectorData?.schedule?.hours ?? []).sort());
        });
        await test.step('26. Check the Additional Options section: If Additional Options were selected, confirm the chosen or inputted content.', async () => {
            // Discussion: How should we handle dynamic components such as JsonSchema?
            // Current processing method: Test only Prowler Case
            if (selectedPluginName.includes('Prowler Security Compliance Collector')) {
                const complianceType = await page.getByTestId('collector-options-section').locator('tbody > tr:nth-child(2) > td.value-wrapper > span > span > span').textContent();
                await expect(complianceType).toContain(selectedComplianceType);
            }
        });
        await test.step('27. Check the Attached Service Accounts section: Confirm if the selected Service Accounts are correct.', async () => {
            const attachedServiceAccountTableRowList = await page.locator('div.p-data-table.bordered.default > div > table > tbody tr');
            const attachedServiceAccountTableRowCount = await attachedServiceAccountTableRowList.count();
            const attachedServiceAccountNameList:any = [];
            for (let i = 0; i < attachedServiceAccountTableRowCount; i++) {
                const attachedServiceAccountName = await attachedServiceAccountTableRowList.nth(i).locator('td').nth(0).textContent();
                attachedServiceAccountNameList.push(attachedServiceAccountName);
            }
            await expect(attachedServiceAccountNameList.sort()).toEqual(selectedServiceAccount.sort());
        });
        await test.step('28. Click the [Collector History] Button at the top to confirm redirection to the history page filtered for the specific collector.', async () => {
            await page.getByRole('button', { name: 'Collector History' }).click();
            await page.mainFrame().waitForURL(/\/asset-inventory\/collector\/history\/.*/);
            await expect(await page.locator('div.tags-wrapper > span > span > span.value-label').textContent()).toContain(collectorData?.name);
            await checkApiCall(page, '/inventory/job/list');
        });
        await test.step('29. Confirm if the collector has existing jobs.', async () => {
            const jobTableRowList = await page.locator('div.p-data-table.bordered.default > div > table > tbody tr');
            const jobTableRowCount = await jobTableRowList.count();
            for (let i = 0; i < jobTableRowCount; i++) {
                const jobName = await jobTableRowList.nth(i).locator('td').nth(2).textContent();
                await expect(jobName).toContain(pluginData?.name);
            }
        });
    });
});
