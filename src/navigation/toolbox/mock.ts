import faker from 'faker';
import { range } from 'lodash';

export const getHandler = items => async (inputText, keyItem) => {
    const allItems = items.map(d => ({ name: d, label: d }));
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
    id: getHandler(range(10).map((d, i) => faker.random.uuid())),
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
