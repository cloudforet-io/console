/* eslint-disable camelcase */
import { faker } from '@faker-js/faker';
import { range } from 'lodash';

export const getTreeData = () => {
    const res = {
        id: faker.datatype.uuid(),
        name: faker.random.word(),
        item_type: faker.helpers.arrayElement(['PROJECT', 'PROJECT_GROUP']),
        has_child: false,
    };
    res.has_child = res.item_type !== 'PROJECT';
    return res;
};


export const getTreeList = () => range(faker.datatype.number({ min: 1, max: 10 })).map(() => getTreeData());


export const getTreeNode = () => ({
    data: getTreeData(),
    disabled: faker.datatype.boolean(),
});

export const getRecursiveInfo = () => {
    const lists = range(faker.datatype.number({ min: 2, max: 5 })).map(() => getTreeList());
    const paths = lists.map((items, listIdx) => {
        const itemIdx = faker.datatype.number({ min: 0, max: items.length - 1 });

        // set last item leaf
        if (listIdx === lists.length - 1) {
            items[itemIdx].has_child = false;
            items[itemIdx].item_type = 'PROJECT';
        }

        return items[itemIdx].id;
    });
    const names = lists.map((items, listIdx) => {
        const itemIdx = faker.datatype.number({ min: 0, max: items.length - 1 });

        // set last item leaf
        if (listIdx === lists.length - 1) {
            items[itemIdx].has_child = false;
            items[itemIdx].item_type = 'PROJECT';
        }

        items[itemIdx].has_child = true;

        return items[itemIdx].name;
    });
    return {
        lists, paths, names,
    };
};

export const getPermissionInfo = (items, res = {}) => {
    items.forEach((d) => {
        res[d.data.id] = faker.datatype.boolean();
        const children = d.getChildrenNodes();
        getPermissionInfo(children, res);
    });
    return res;
};
