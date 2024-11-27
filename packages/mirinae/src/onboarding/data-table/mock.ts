import { faker } from '@faker-js/faker';
import { range } from 'lodash';

const getUser = () => ({
    name: faker.name.firstName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    cost: faker.datatype.number({ min: 0, max: 1000 }),
    homepage: faker.internet.url(),
    type: faker.datatype.boolean(),
});

export const getUserData = (min = 7, max = 15) => range(faker.datatype.number({ min, max })).map(() => getUser());

export const getUserFields = () => [
    { name: 'name', label: 'Name', sortable: true },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', textAlign: 'center' },
    { name: 'cost', label: 'Cost', textAlign: 'right' },
];

const getBehaviorsAndStates = () => ({
    name: faker.name.firstName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    job_type: faker.name.jobType(),
    cost: faker.commerce.price(),
    action: 'button',
});

export const getBehaviorsAndStatesData = (min = 7, max = 15) => range(faker.datatype.number({ min, max })).map(() => getBehaviorsAndStates());

export const getBehaviorsAndStatesFields = () => [
    { name: 'name', label: 'Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'job_type', label: 'JobType', textAlign: 'center' },
    { name: 'cost', label: 'Cost' },
    { name: 'action', label: 'Action' },
];
