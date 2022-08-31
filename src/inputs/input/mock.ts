import { faker } from '@faker-js/faker';
import { range } from 'lodash';

const getMenuItem = () => ({
    name: faker.datatype.uuid(),
    label: `${faker.random.word()}`, // (${faker.random.word()})`,
    type: 'item',
    // disabled: faker.datatype.boolean(),
});

export const getTextInputMenu = (min = 10, max = 30) => range(faker.datatype.number({ min, max })).map(() => getMenuItem());
