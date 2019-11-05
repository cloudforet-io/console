// This is just sample
import jsf from 'json-schema-faker';
import faker from 'faker';

jsf.extend('faker', () => faker);

const userSchema = {
    type: 'object',
    required: [
        'roles',
        'user_id',
        'name',
        'state',
        'email',
        'mobile',
        'group',
        'tags',
        'domain_id',
        'language',
        'timezone',
    ],
    properties: {
        roles: {
            type: 'array',
        },
        user_id: {
            type: 'string',
            faker: 'internet.userName',
        },
        name: {
            type: 'string',
            faker: 'name.findName',
        },
        state: {
            enum: [
                'ENABLED',
                'DISABLED',
            ],
        },
        email: {
            type: 'string',
            format: 'email',
            faker: 'internet.email',
        },
        mobile: {
            type: 'string',
            faker: 'phone.phoneNumber',
        },
        group: {
            enum: [
                'groupA',
                'groupB',
            ],
        },
        language: {
            enum: [
                'ko',
                'en',
            ],
        },
        timezone: {
            enum: [
                'utc+9',
                'utc',
            ],
        },
        tags: { tag1: 'abcd', tag2: 'cdfg' },
        last_accessed_at: {
            type: 'object',
            required: [
                'seconds',
                'nanos',
            ],
            properties: {
                seconds: {
                    type: 'string',
                    faker: {
                        fake: '{{random.number}}',
                    },
                },
                nanos: {
                    type: 'integer',
                    minimum: 999999999,
                    maximum: 100000000,
                },
            },
        },
        created_at: {
            type: 'object',
            required: [
                'seconds',
                'nanos',
            ],
            properties: {
                seconds: {
                    type: 'string',
                    faker: {
                        fake: '{{random.number}}',
                    },
                },
                nanos: {
                    type: 'integer',
                    minimum: 999999999,
                    maximum: 100000000,
                },
            },
        },
        domain_id: {
            type: 'string',
            faker: {
                fake: 'domain-{{finance.iban}}',
            },
        },
    },
};

export const mockUser = () => jsf.generate(userSchema);
export const mockUserList = (count) => {
    const data = [];
    for (let step = 0; step < count; step++) {
        data.push(mockUser());
    }
    console.log(data);
    return data;
};
