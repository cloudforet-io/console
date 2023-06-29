import { test, expect } from '@playwright/test';


test.describe('Collector Create', () => {
    test('1. [ + Create ] or [ + Create Collector ] Clicked, create a total of 3 different collectors according to the following scenario.', async ({ page }) => {
        await page.goto('/asset-inventory/collector');
        let createButton = await page.getByRole('button', { name: 'Create' })
        if (!createButton) {
            createButton = await page.getByRole('button', { name: 'Create Collector' })
        }
        await createButton.click();
        await page.waitForNavigation();
        expect(page.url()).toBe(process.env.BASEURL + '/asset-inventory/collector/create');
    })

    test('2. Collector Create Step 1', async ({ page }) => {
        const SEARCH_TERM = 'prowler';

        await page.goto('/asset-inventory/collector/create');

        await test.step('1.1 Enter a search term in the search bar -> Check the result list', async () => {
            const searchBar = await page.locator('.input-container').getByPlaceholder('Search', { exact: true })
            await searchBar.click();
            await searchBar.fill(SEARCH_TERM);
            await searchBar.press('Enter');

            // wait for the response
            const responsePromise = page.waitForResponse(response => {
                const url = response.url();
                if (url !== `${process.env.APIURL as string}/repository/plugin/list`) return false;
                const payload = response.request().postDataJSON()
                console.log('plugin list payload: ', payload)
                return payload?.query?.keyword === SEARCH_TERM;
            });
            const response = await responsePromise
            expect(response.status()).toBe(200);
            const data = await response.json();

            // wait for the first item to be attached to the DOM
            await page.locator('.p-board-item').waitFor({ state: 'attached' });

            // check the number of items
            const searchedItems = await page.locator('.p-board-item').elementHandles()
            expect(searchedItems).toHaveLength(data.results.length > 10 ? 10 : data.results.length);
        })
    })
})