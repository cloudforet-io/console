import { faker } from '@faker-js/faker';
import { range } from 'lodash';

const getMenuItem = () => ({
    name: faker.datatype.uuid(),
    label: `${faker.random.word()}`, // (${faker.random.word()})`,
    type: 'item',
    // disabled: faker.datatype.boolean(),
});

export const getSearchDropdownMenu = (min = 10, max = 30) => range(faker.datatype.number({ min, max })).map(() => getMenuItem());
export const getSearchDropdownMenuWithMultiTypes = () => range(30).map((i) => {
    const result = getMenuItem();

    if ([0, 10, 20].includes(i)) {
        result.type = 'header';
    } else if ([1, 11, 21].includes(i)) {
        result.type = 'divider';
    }

    return result;
});
