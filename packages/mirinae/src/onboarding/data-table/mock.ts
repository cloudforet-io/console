import { faker } from '@faker-js/faker';
import { range } from 'lodash';

const getUser = () => ({
    name: faker.name.firstName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    job_type: faker.name.jobType(),
    cost: faker.commerce.price(),
    action: 'button',
});

export const getData = (min = 7, max = 15) => range(faker.datatype.number({ min, max })).map(() => getUser());

export const getDataFields = () => [
    { name: 'name', label: 'Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'job_type', label: 'JobType', textAlign: 'center' },
    { name: 'cost', label: 'Cost' },
    { name: 'action', label: 'Action' },
];

const getUser2 = () => ({
    name: faker.name.firstName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    cost: faker.commerce.price(),
    homepage: faker.internet.url(),
});

export const getUser2Data = (min = 7, max = 15) => range(faker.datatype.number({ min, max })).map(() => getUser2());

export const getUser2Fields = () => [
    { name: 'name', label: 'Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'cost', label: 'Cost', textAlign: 'right' },
    { name: 'homepage', label: 'Home Page' },
];
