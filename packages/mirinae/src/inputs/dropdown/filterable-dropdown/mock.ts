import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import type { DropdownMenuItem } from '@/inputs/dropdown/filterable-dropdown/type';

const getMenuItem = (word?: string): DropdownMenuItem => {
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

export const getFilterableDropdownMenu = (min = 10, max = 30, word?: string): DropdownMenuItem[] => range(faker.datatype.number({ min, max })).map(() => getMenuItem(word));
export const getFilterableDropdownMenuWithMultiTypes = (): DropdownMenuItem[] => range(30).map((i) => {
    const result = getMenuItem();

    if ([0, 10, 20].includes(i)) {
        result.type = 'header';
    } else if ([1, 11, 21].includes(i)) {
        result.type = 'divider';
    }

    return result;
});

