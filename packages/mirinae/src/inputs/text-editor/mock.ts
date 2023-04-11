import { faker } from '@faker-js/faker';

export const getJsonObject = () => JSON.parse(faker.datatype.json());
