import { faker } from '@faker-js/faker';

export const getDefaultSchema = () => ({
    type: 'object',
    properties: {
        user_id: {
            title: 'ID',
            format: 'generate_id',
            markdown: '[How to generate ID?](https://www.google.com)',
        },
        password: {
            title: 'Password',
            minLength: 8,
            format: 'password',
            default: '12345678',
        },
        user_name: {
            minLength: 4,
            title: 'Name',
            examples: [
                'Wanjin',
            ],
            description: 'Your name',
            type: 'string',
        },
        user_nickname: {
            title: 'Nickname',
            description: 'Nick name',
            minLength: 1,
            type: 'string',
            examples: [
                'Genie',
            ],
        },
        country_code: {
            examples: ['82'],
            description: 'Country code to call. Only numbers without special characters. Not mandatory, 82(Korea country code) is default.',
            title: 'Country Code',
            pattern: '^[0-9\\-]{1,5}$',
            minLength: 1,
            type: 'string',
            default: '82',
        },
        age: {
            title: 'Age',
            type: 'number',
            examples: ['27'],
        },
        emails: {
            description: 'Email addresses',
            title: 'Email Addresses',
            minLength: 10,
            type: 'array',
            pattern: '^[\\W]*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4}[\\W]*,{1}[\\W]*)*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4})[\\W]*$',
            items: [{ type: 'string' }],
            examples: [
                'user1@test.com, user2@test.com',
            ],
        },
        homepage: {
            type: 'string',
            minLength: 4,
            examples: [
                'https://myjira.atlassian.net',
            ],
            title: 'Homepage',
            description: 'Homepage URL',
        },
        phone: {
            pattern: '^(01([0|1|6|7|8|9]?)\\d{7,8}(, |,|$))*',
            description: 'The phone number to receive alerts. Must insert the cell phone numbers format without special characters.',
            title: 'Phone',
            examples: [
                '0104445566, 01077778888',
            ],
            type: 'string',
            minLength: 10,
        },

    },
    required: ['user_id', 'password', 'user_name', 'age', 'homepage', 'phone'],
});

export const getDefaultFormData = () => ({
    user_name: faker.name.firstName(),
    user_nickname: faker.random.word(),
    age: faker.datatype.number(),
    phone: faker.phone.number(),
});
