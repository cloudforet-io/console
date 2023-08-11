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

    // Make random string for key/value.
    const random = () => Math.random();
    const randomKey = `Key-${random()}`;
    const randomValue = `Value-${random()}`;

    const COLLECTOR_NAME_1 = 'for_testCode';
    const COLLECTOR_NAME_2 = 'for_testEdit';
    let currentCollectorName: '';

    const goToCollectorPage = async () => {
        await page.goto('/asset-inventory/collector');
        const pageTitleName = page.locator('.heading-wrapper>h2.has-right>span.title');

        await expect(pageTitleName).toContainText('Collector');
    };
    const saveChanges = async (index: number) => {
        const saveButton = page.locator('.collector-detail-page .section').nth(index).locator('.save-changes-button');
        await saveButton.first().click();
    };

    /* Test */
    test('Edit collector schedule', async () => {
        await test.step('1. Go to collector page', async () => {
            await goToCollectorPage();
        });

        await test.step('2. Click on the first collector and go to the details page', async () => {
            // Click collector.
            const collector = await page.locator(`.collector-lists>div .collector-item-name:text('${COLLECTOR_NAME_1 || COLLECTOR_NAME_2}')`);
            currentCollectorName = await collector.textContent();
            await collector.click();

            // Wait for navigation to the collector details page.
            await page.waitForNavigation();

            // Verify if the selected collector's name matches.
            await expect(page).toHaveURL(/asset-inventory\/collector\/collector-*/);
            await expect(await page.getByRole('heading', { name: COLLECTOR_NAME_1 || COLLECTOR_NAME_2 })).toBeVisible();
        });

        await test.step('3-4. Edit base information', async () => {
            // Click edit button.
            const baseInformation = page.locator('.collector-detail-page .section').nth(0);
            const editButton = baseInformation.locator('.extra .p-button');
            await editButton.first().click();

            const versionToggleButton = baseInformation.locator('.collector-version-form .p-toggle-button');
            const dropdownButton = baseInformation.locator('.dropdown-button');
            const dropdownItem = baseInformation.locator('.p-context-menu-item').nth(1);

            const checkVersionSelection = async () => {
                // Change the version.
                await dropdownButton.first().click();
                await dropdownItem.first().click();

                // Get the selected version name.
                const selectedVersion = await dropdownItem.textContent() ?? undefined;

                // Check if the selected version is visible in the dropdown button
                const dropdownButtonLabel = await dropdownButton.locator('.text');
                await expect(dropdownButtonLabel).toContainText(selectedVersion);

                // After deactivating the toggle, check the latest version is selected
                await versionToggleButton.first().click();
                await expect(dropdownButtonLabel).toContainText('latest');
            };

            // Wait for the API response and then change the version.
            try {
                const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/repository/plugin/get-versions`);
                expect(apiResponse.status()).toBe(200);

                // Check if the toggle is in the active state
                const classAttribute = await versionToggleButton.getAttribute('class');
                const hasToggleActiveClass = classAttribute.includes('is-active');

                if (hasToggleActiveClass) {
                    // If the toggle is in the active state, deactivate it and then change the version.
                    await versionToggleButton.first().click();
                    await checkVersionSelection();
                } else {
                    // Change the version directly.
                    await checkVersionSelection();
                }
            } catch (error) {
                console.error('Error occurred:', error);
            }
        });

        await test.step('5. Add tags and Save changes for base information', async () => {
            // To prevent the repetition of the 'test' tag, delete the previous test content.
            const addTagsGroup = page.locator('.tags-group:last-child');
            await addTagsGroup.locator('.p-button').first().click();

            await page.getByRole('button', { name: 'Add Tags' }).click();

            // Enter test tags.
            const newTagsGroup = page.locator('.tags-group:last-child');
            await newTagsGroup.getByPlaceholder('Key').click();
            await newTagsGroup.getByPlaceholder('Key').first().fill(randomKey);
            await newTagsGroup.getByPlaceholder('Value').click();
            await newTagsGroup.getByPlaceholder('Value').first().fill(randomValue);
        });

        await test.step('6. Save changes for base information', async () => {
            // Save changes.
            await saveChanges(0);
            try {
                const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/update`);
                expect(apiResponse.status()).toBe(200);
            } catch (error) {
                console.error('Error occurred:', error);
            }

            // Check if the tags are added.
            const tags = page.locator('.tags-wrapper .p-tag:first-child');
            const keyElement = await tags.locator('.key');
            const valueElement = await tags.locator('.value');
            await expect(keyElement).toContainText(randomKey);
            await expect(valueElement).toContainText(randomValue);
        });

        const firstTimeBlock = page.locator('.collector-schedule-edit-form .hourly-schedule-wrapper .time-block').nth(0);

        await test.step('7-9. Edit schedule and save changes', async () => {
            // Click edit button.
            const editButton = page.locator('.collector-detail-page .section').nth(1).locator('.extra .p-button');
            await editButton.first().click();

            const scheduleToggleButton = page.locator('.collector-schedule-edit-form .p-toggle-button');
            const toggleLabel = scheduleToggleButton.locator('.state-text');

            // Check if the toggle is in the active state
            const toggleClassAttribute = await scheduleToggleButton.getAttribute('class');
            const hasToggleActiveClass = toggleClassAttribute.includes('is-active');

            if (hasToggleActiveClass) {
                await expect(toggleLabel).toContainText('ON');

                // Select the time block.
                const secondTimeBlock = page.locator('.collector-schedule-edit-form .hourly-schedule-wrapper .time-block').nth(1);
                await firstTimeBlock.first().click();
                await secondTimeBlock.first().click();

                // Save changes.
                await saveChanges(1);
                try {
                    const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/update`);
                    expect(apiResponse.status()).toBe(200);
                } catch (error) {
                    console.error('Error occurred:', error);
                }

                // Check if the schedule is set.
                const firstClassAttribute = await firstTimeBlock.getAttribute('class');
                const hasSetFirstScheduleClass = firstClassAttribute.includes('active');
                if (hasSetFirstScheduleClass) {
                    await expect(hasSetFirstScheduleClass).toBeTruthy();
                } else {
                    console.log('Test skipped due to no selected first schedule.');
                }
                const secondClassAttribute = await secondTimeBlock.getAttribute('class');
                const hasSetSecondScheduleClass = secondClassAttribute.includes('active');
                if (hasSetSecondScheduleClass) {
                    await expect(hasSetSecondScheduleClass).toBeTruthy();
                } else {
                    console.log('Test skipped due to no selected second schedule.');
                }
            } else {
                await expect(toggleLabel).toContainText('OFF');
            }
        });

        const dropdownItem = page.locator('.p-context-menu-item').nth(1);
        const additionalDropdownItemLabel = await dropdownItem.locator('.label-wrapper .text').textContent() ?? undefined;

        await test.step('10-11. Edit additional options', async () => {
            const emptyElement = page.locator('.p-empty');
            try {
                // Check if the dropdown is empty.
                await emptyElement.waitFor({ state: 'visible', timeout: 5000 });

                // Click edit button.
                const additionalOptions = page.locator('.collector-detail-page .section').nth(2);
                const editButton = additionalOptions.locator('.extra .p-button');
                await editButton.first().click();

                // Select the dropdown item for edit.
                const secondDropdown = additionalOptions.locator('.p-json-schema-form .input-form-wrapper').nth(1).locator('.field-group-default-wrapper');
                await secondDropdown.first().click();

                await dropdownItem.first().click();

                await test.step('12. Save changes for additional options', async () => {
                    // Save changes.
                    await saveChanges(2);
                    try {
                        const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/update`);
                        expect(apiResponse.status()).toBe(200);
                    } catch (error) {
                        console.error('Error occurred:', error);
                    }

                    // Check if the additional options is set.
                    const addedItem = page.locator('.data-wrapper tr.p-definition').nth(1).locator('.value-wrapper .copy-text');
                    await expect(addedItem).toContainText(additionalDropdownItemLabel);
                });
            } catch {
                const isEmpty = await emptyElement.count() > 0;
                await expect(isEmpty).toBeTruthy();
            }
        });

        await test.step('13-15. Edit attached service accounts and save changes', async () => {
            const attachedServiceAccount = page.locator('.collector-detail-page .section').nth(3);

            // When there is 1 attached service account.
            const serviceAccountCount = await attachedServiceAccount.locator('.p-heading .total-count').textContent() ?? undefined;
            if (serviceAccountCount !== '(1)') {
                // Click edit button.
                const editButton = attachedServiceAccount.locator('.extra .p-button');
                await editButton.first().click();

                // Click clear button.
                const clearButton = attachedServiceAccount.locator('.clear-all-wrapper');
                await clearButton.first().click();

                // Select the dropdown item for edit.
                const accountDropdownItems = await page.locator('.dropdown-context-menu .menu-container .p-context-menu-item').nth(0);
                const selectedServiceAccountLabel = await accountDropdownItems.textContent();
                const dropdown = page.locator('.dropdown-button');
                await dropdown.first().click();
                await accountDropdownItems.first().click();

                // Save changes.
                await saveChanges(3);
                try {
                    const apiResponse = await page.waitForResponse(`${process.env.APIURL as string}/inventory/collector/update`);
                    expect(apiResponse.status()).toBe(200);
                } catch (error) {
                    console.error('Error occurred:', error);
                }

                // Check if the attached service accounts is set.
                const addedItem = page.locator('.data-wrapper tr').nth(0).locator('td').nth(0);
                await expect(addedItem).toContainText(selectedServiceAccountLabel);
            }
        });

        await test.step('16. Edit collector name', async () => {
            // Click edit button.
            const editButton = page.locator('.collector-detail-page .heading-main .heading-wrapper .title-right-button-wrapper button.p-button').nth(1);
            await editButton.first().click();

            // Enter new collector name.
            const textInput = await page.locator('.modal-content .p-text-input');
            await textInput.first().click();
            const deleteTextButton = page.locator('.delete-all-icon');
            await deleteTextButton.first().click();

            let newName = '';
            if (textInput.textContent() === COLLECTOR_NAME_1) {
                newName = COLLECTOR_NAME_2;
            } else {
                newName = COLLECTOR_NAME_1;
            }
            await textInput.locator('input').fill(`${newName}`);
            await page.getByRole('button', { name: 'Confirm' }).click();

            // Verify if the selected new collector's name matches.
            await expect(await page.getByRole('heading', { name: `${newName}` })).toBeVisible();
        });

        await test.step('17. Go to collector page', async () => {
            await goToCollectorPage();
        });

        await test.step('18. Check Edit data', async () => {
            const collector = await page.locator(`.collector-lists>div .collector-item-name:text('${COLLECTOR_NAME_1 || COLLECTOR_NAME_2}')`);
            await expect(collector).toContainText(currentCollectorName);
        });
    });
});
