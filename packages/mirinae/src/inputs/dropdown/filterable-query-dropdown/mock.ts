import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import type {
    KeyItemSet,
    ValueHandler, ValueHandlerMap,
} from '@/inputs/search/query-search/type';
import { getTextHighlightRegex } from '@/utils/helpers';

const getKeyItem = () => ({
    label: faker.random.word(),
    name: faker.datatype.uuid(),
});
export const getKeyItems = (length = 10) => range(length).map(() => getKeyItem());

export const getKeyItemSet = (length = 10) => ({
    title: faker.name.jobTitle(),
    items: getKeyItems(length),
});

export const getKeyItemSets = (itemLength = 10, setLength = 3) => range(setLength).map(() => getKeyItemSet(itemLength));

export const getValueItems = (length = 20) => range(length).map(() => ({ label: faker.random.word(), name: faker.datatype.uuid() }));

export const getValueHandler = (items = getValueItems()): ValueHandler => (inputText: string) => {
    let results = items;
    if (inputText) {
        const regex = getTextHighlightRegex(inputText);
        results = results.filter((d) => regex.test(d.label));
    }

    return {
        results,
        totalCount: results.length,
    };
};

export const getValueHandlerMap = (keyItemSets: KeyItemSet[]): ValueHandlerMap => {
    const handlerMap = {};

    keyItemSets.forEach(({ items }) => {
        items.forEach(({ name }) => {
            handlerMap[name] = getValueHandler();
        });
    });

    return handlerMap;
};
