import faker from 'faker';
import { range } from 'lodash';

const getMenuItem = () => ({
    name: faker.random.uuid(),
    label: faker.random.word(),
    type: 'item',
    // disabled: faker.random.boolean(),
});

export const getAutocompleteMenu = (min = 10, max = 30) => range(faker.random.number({ min: 10, max: 30 })).map(() => getMenuItem());
export const getAutocompleteMenuWithMultiTypes = () => range(30).map((i) => {
    const result = getMenuItem();

    if ([0, 10, 20].includes(i)) {
        result.type = 'header';
    } else if ([1, 11, 21].includes(i)) {
        result.type = 'divider';
    }

    return result;
});
