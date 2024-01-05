import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import type { SelectDropdownMenuItem } from '@/inputs/dropdown/select-dropdown/type';
import { getTextHighlightRegex } from '@/utils';

const getMenuItem = (word?: string): SelectDropdownMenuItem => {
    let label = faker.random.word();
    if (word) {
        label = label.slice(0, label.length / 2) + word + label.slice(label.length / 2);
    }
    return {
        name: faker.datatype.uuid(),
        label,
        type: 'item',
        // disabled: faker.datatype.boolean(),
    };
};

export const getSelectDropdownMenu = (min = 10, max = 30, word?: string): SelectDropdownMenuItem[] => range(faker.datatype.number({ min, max })).map(() => getMenuItem(word));
export const getSelectDropdownMenuWithMultiTypes = (): SelectDropdownMenuItem[] => range(30).map((i) => {
    const result = getMenuItem();

    if ([0, 10, 20].includes(i)) {
        result.type = 'header';
    } else if ([1, 11, 21].includes(i)) {
        result.type = 'divider';
    }

    return result;
});
export const getSelectDropdownMenuWithHeaderNames = (): SelectDropdownMenuItem[] => {
    const menu = getSelectDropdownMenu(10, 30);
    const headerNames = range(3).map(() => faker.random.word());
    menu.forEach((item, i) => {
        if (i % 10 === 0) {
            item.type = 'header';
            item.name = headerNames[i / 10];
        } else {
            item.headerName = headerNames[Math.floor(i / 10)];
        }
    });
    return menu;
};

export const getHandler = (dataSetCount = 3, timeout = 500) => {
    const menuList = range(dataSetCount).map(() => getSelectDropdownMenu());
    const allResults: SelectDropdownMenuItem[][] = range(dataSetCount).map(() => []);
    const simpleHandler = async (inputText: string, pageStart?: number, pageLimit?: number, filters?: SelectDropdownMenuItem[], resultRef?: number) => {
        if (resultRef === undefined) {
            const promiseResults = await Promise.all(menuList.map((menu, i) => new Promise((resolve) => {
                setTimeout(() => {
                    getTextHighlightRegex(inputText);
                    const filtered = menu.filter((d) => getTextHighlightRegex(inputText).test(d.label as string));
                    allResults[i] = filtered;
                    resolve(filtered);
                }, timeout);
            })));
            return promiseResults.map((results, i) => {
                const sliced = allResults[i].slice(pageStart ? pageStart - 1 : 0, pageLimit);
                return {
                    results: sliced,
                    more: allResults[i].length > (pageLimit || sliced.length),
                };
            });
        }

        await new Promise((resolve) => {
            setTimeout(() => {
                getTextHighlightRegex(inputText);
                const filtered = menuList[resultRef].filter((d) => getTextHighlightRegex(inputText).test(d.label as string));
                allResults[resultRef] = filtered;
                resolve(filtered);
            }, timeout);
        });
        const responses = range(dataSetCount).map((i) => {
            if (i !== resultRef) return { results: [] };
            const sliced = allResults[resultRef].slice(pageStart ? pageStart - 1 : 0, pageLimit);
            return {
                results: sliced,
                more: allResults[resultRef].length > (pageLimit || sliced.length),
            };
        });
        return responses;
    };

    return simpleHandler;
};
