import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import { getQuerySearchTags } from '@/inputs/search/query-search-tags/mock';

export const getHandler = (items) => async (inputText) => {
    const allItems = items.map((d) => ({ name: d, label: d }));
    let res = [...allItems];
    const regex = RegExp(inputText, 'i');

    if (inputText) {
        res = allItems.reduce((result, d) => {
            if (regex.test(d.label) || regex.test(d.name)) result.push(d);
            return result;
        }, []);
    }
    return {
        results: res,
        totalCount: allItems.length,
    };
};

export const getValueHandlerMap = () => ({
    id: getHandler(range(10).map(() => faker.datatype.uuid())),
    name: getHandler(range(10).map(() => faker.name.findName())),
    group: getHandler(range(10).map(() => faker.name.jobArea())),
});


export const getKeyItemSets = () => [
    {
        title: 'Key',
        items: [{
            name: 'id',
            label: 'ID',
        },
        {
            name: 'name',
            label: 'Name',
        },
        {
            name: 'group',
            label: 'Group',
        }],
    },
];

export const getQueryTags = () => getQuerySearchTags();
