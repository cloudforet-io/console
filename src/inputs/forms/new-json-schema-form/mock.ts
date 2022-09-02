import { faker } from '@faker-js/faker';

export const getDefaultSchema = () => ({
    type: 'object',
    properties: {
        channel: {
            minLength: 4,
            title: 'Slack Channel',
            examples: [
                'everyone',
            ],
            description: 'Slack channel to be received messages in your workspace',
            type: 'string',
        },
        chat_id: {
            title: 'Chat ID',
            description: 'Chat ID of the group to receive messages in your chats. The Chat ID will most likely be a negative number in the form of -#########.',
            minLength: 1,
            type: 'string',
            examples: [
                '-514081686',
            ],
        },
        country_code: {
            examples: ['82'],
            description: 'Country code to call. Only numbers without special characters. Not mandatory, 82(Korea country code) is default.',
            title: 'Country Code',
            pattern: '^[0-9\\-]{1,5}$',
            minLength: 1,
            type: 'string',
        },
        required_number: {
            title: 'Required Number',
            type: 'number',
            examples: ['0'],
        },
        email: {
            description: 'Email address to receive notifications',
            title: 'Email Address',
            minLength: 10,
            type: 'string',
            pattern: '^[\\W]*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4}[\\W]*,{1}[\\W]*)*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4})[\\W]*$',
            examples: [
                'user1@test.com, user2@test.com',
            ],
        },
        url: {
            type: 'string',
            minLength: 4,
            examples: [
                'https://myjira.atlassian.net',
            ],
            title: 'JIRA URL',
            description: 'Atlassian JIRA URL',
        },
        phone_number: {
            pattern: '^(01([0|1|6|7|8|9]?)\\d{7,8}(, |,|$))*',
            description: 'The phone number to receive alerts. Must insert the cell phone numbers format without special characters.',
            title: 'Phone Number',
            examples: [
                '0104445566, 01077778888',
            ],
            type: 'string',
            minLength: 10,
        },
        google_cert_url: {
            title: 'Google Cloud Auth Provider X509 Cert URL',
            minLength: 4,
            type: 'string',
            default: 'https://www.googleapis.com/oauth2/v1/certs',
        },
    },
    required: ['channel', 'required_number', 'url', 'phone_number', 'google_cert_url'],
});

export const getDefaultFormData = () => ({
    channel: faker.lorem.word(3),
    chat_id: faker.random.word(),
    phone_number: faker.phone.number(),
    required_number: faker.datatype.number(),
});
