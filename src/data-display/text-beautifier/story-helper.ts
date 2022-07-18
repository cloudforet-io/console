import { faker } from '@faker-js/faker';
import type { ArgTypes } from '@storybook/addons';

export const getTextBeautifierArgTypes = (): ArgTypes => ({
    value: {
        name: '',
        type: { name: 'string' },
        description: 'The value to beautify',
        defaultValue: `${faker.lorem.sentence(30)} ${faker.internet.url()} ${faker.lorem.sentence(30)}`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    tag: {
        name: '',
        type: { name: 'tag' },
        description: 'The tag of root element',
        defaultValue: 'span',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"span"',
            },
        },
        control: {
            type: 'text',
        },
    },

    // object: {
    //     name: '',
    //     type: { name: 'object' },
    //     description: '',
    //     defaultValue: undefined,
    //     table: {
    //         type: {
    //             summary: 'object',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: 'undefined',
    //         },
    //     },
    //     control: {
    //         type: 'object',
    //     },
    // },

    // boolean: {
    //     name: '',
    //     type: { name: 'boolean' },
    //     description: '',
    //     defaultValue: false,
    //     table: {
    //         type: {
    //             summary: 'boolean',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: false,
    //         },
    //     },
    //     control: {
    //         type: 'boolean',
    //     },
    // },

    // select: {
    //     name: '',
    //     type: { name: 'string' },
    //     description: `Select XXX. ${
    //         [...Object.values(CONFIG)].map(d => `\`\``)} are available.`,
    //     defaultValue: '',
    //     table: {
    //         type: {
    //             summary: 'string',
    //         },
    //         category: 'props',
    //         defaultValue: {
    //             summary: '',
    //         },
    //     },
    //     control: {
    //         type: 'select',
    //         options: [...Object.values(CONFIG)],
    //     },
    // },

    // slots
    // defaultSlot: {
    //     name: 'default',
    //     description: '',
    //     defaultValue: null,
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
    //     defaultValue: null,
    //     table: {
    //         type: {
    //             summary: null,
    //         },
    //         category: 'events',
    //     },
    // }
});
