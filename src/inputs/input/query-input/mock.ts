import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import type {
    KeyItem,
    KeyItemSet,
    ValueHandler, ValueHandlerMap,
    KeyDataType,
    ValueMenuItem,
} from '@/inputs/search/query-search/type';

const getKeyItem = (dataType?: KeyDataType): KeyItem => {
    const result: KeyItem = {
        label: faker.random.word(),
        name: faker.datatype.uuid(),
        dataType,
    };
    if (dataType) {
        result.label = `(${dataType}) ${result.label}`;
    }
    return result;
};
export const getKeyItems = (length = 10, dataTypes: KeyDataType[] = []): KeyItem[] => range(length).map((i) => getKeyItem(dataTypes[i]));

export const getKeyItemSet = (length = 10, dataTypes: KeyDataType[]): KeyItemSet => ({
    title: faker.name.jobTitle(),
    items: getKeyItems(length, dataTypes),
});

export const getKeyItemSets = (itemLength = 10, setLength = 3, dataTypes: KeyDataType[] = []): KeyItemSet[] => range(setLength).map(() => getKeyItemSet(itemLength, dataTypes));

const getValueItem = (dataType?: KeyDataType): ValueMenuItem => {
    const result: ValueMenuItem = {
        label: dataType ? `${faker.random.word()}-${dataType}` : faker.random.word(),
        name: faker.datatype.uuid(),
    };
    return result;
};
export const getValueItems = (length = 20, dataTypes: KeyDataType[] = []) => range(length).map((i) => getValueItem(dataTypes[i]));

export const getValueHandler = (dataTypes: KeyDataType[] = []): ValueHandler => (inputText?: string|number) => {
    const items = getValueItems(20, dataTypes);
    let results: ValueMenuItem[] = items;
    if (inputText !== undefined && inputText !== '') {
        const text = typeof inputText === 'number' ? `${inputText}` : inputText;
        const regex = new RegExp(text, 'i');
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
