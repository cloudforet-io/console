import { faker } from '@faker-js/faker';
import { range } from 'lodash';

const getUser = () => ({
    name: faker.name.firstName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    cost: faker.commerce.price(),
    homepage: faker.internet.url(),
});

export const getUsers = (min = 7, max = 15) => range(faker.datatype.number({ min, max })).map(() => getUser());

export const getUserFields = () => [
    { name: 'name', label: 'Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'cost', label: 'Cost', textAlign: 'right' },
    { name: 'homepage', label: 'Home Page' },
];

export const getLongUsers = (min = 7, max = 15) => range(faker.datatype.number({ min, max })).map(() => ({
    name: faker.lorem.sentence(15),
    phone: faker.lorem.sentence(15),
    email: faker.internet.email(),
    cost: faker.lorem.sentence(15),
    homepage: faker.internet.url(),
}));
