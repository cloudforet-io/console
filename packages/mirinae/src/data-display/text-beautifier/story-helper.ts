import { faker } from '@faker-js/faker';

export const getTextBeautifierDefaultArgs = () => ({
    value: `${faker.lorem.sentence(30)} ${faker.internet.url()} ${faker.lorem.sentence(30)}`,
    tag: 'span',
    // object: undefined,
    // boolean: false,
    // select: '',
    // defaultSlot: undefined,
    // onClick: undefined
});

export const getTextBeautifierArgTypes = () => ({
    value: {
        name: '',
        type: 'string',
        description: 'The value to beautify',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    tag: {
        name: '',
        type: 'tag',
        description: 'The tag of root element',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"span"',
            },
        },
        control: 'text',
    },

    // object: {
    //     name: '',
    //     type: 'object',
    //     description: '',
    //     table: {
    //         type: {
    //             summary: 'object',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: 'undefined',
    //         },
    //     },
    //     control: 'object'
    // },

    // boolean: {
    //     name: '',
    //     type: 'boolean',
    //     description: '',
    //     table: {
    //         type: {
    //             summary: 'boolean',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: false,
    //         },
    //     },
    //     control: 'boolean'
    // },

    // select: {
    //     name: '',
    //     type: 'string',
    //     description: `Select XXX. ${
    //         [...Object.values(CONFIG)].map(d => `\`\``)} are available.`,
    //     table: {
    //         type: {
    //             summary: 'string',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: '',
    //         },
    //     },
    //     control: 'select',
    //     options: [...Object.values(CONFIG)],
    // },

    // slots
    // defaultSlot: {
    //     name: 'default',
    //     description: '',
    //     table: {
    //         type: {
    //             summary: null,
    //         },
    //         category: 'slots',
    //     },
    // },


    // events
    // onClick: {
    //     name: '',
    //     description: '',
    //     table: {
    //         type: {
    //             summary: null,
    //         },
    //         category: 'events',
    //     },
    // }
});
