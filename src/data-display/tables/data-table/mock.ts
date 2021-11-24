import faker from 'faker';
import { range } from 'lodash';

const getUser = () => ({
    name: faker.name.firstName(),
    phone: faker.phone.phoneNumberFormat(),
    email: faker.internet.email(),
    cost: faker.commerce.price(),
});

export const getUsers = (min = 7, max = 15) => range(faker.random.number({ min, max })).map(() => getUser());

export const getUserFields = () => [
    { name: 'name', label: 'Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'cost', label: 'Cost', textAlign: 'right' },
];

export const getLongUsers = (min = 7, max = 15) => range(faker.random.number({ min, max })).map(() => ({
    name: faker.lorem.sentence(15),
    phone: faker.lorem.sentence(15),
    email: faker.lorem.sentence(15),
    cost: faker.lorem.sentence(15),
}));
