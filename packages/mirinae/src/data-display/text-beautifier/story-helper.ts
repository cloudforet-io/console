import { faker } from '@faker-js/faker';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

export const getTextBeautifierArgs = (): Args => ({
    value: `${faker.lorem.sentence(30)} ${faker.internet.url()} ${faker.lorem.sentence(30)}`,
    tag: 'span',
    // object: undefined,
    // boolean: false,
    // select: '',
    // defaultSlot: null,
    // onClick: null
});

export const getTextBeautifierParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getTextBeautifierArgTypes = (): ArgTypes => ({
    value: {
        name: '',
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    //     type: { name: 'object' },
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
    //     type: { name: 'boolean' },
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
    //     type: { name: 'string' },
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
