import { faker } from '@faker-js/faker';

import { styleTypes } from './config';

export const getNotificationBarDefaultArgs = () => ({
    visible: true,
    styleType: 'dark',
    'v-model': false,
    default: faker.lorem.lines(5),
});

export const getNotificationBarArgTypes = () => ({
    visible: {
        name: 'visible',
        type: 'boolean',
        required: true,
        description: 'Switch props for show or hide a notification bar.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    styleType: {
        name: 'styleType',
        type: 'string',
        description: `Style type of notification bar.<br/>
                      \`${styleTypes}\` are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '\'dark\'',
            },
        },
        control: 'select',
        options: styleTypes,
    },
    'v-model': {
        name: 'v-model',
        type: 'boolean',
        required: false,
        description: 'Two way binding for `visible` props with `update:visible` event.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'model',
            defaultValue: {
                summary: false,
            },
        },
        control: null,
    },
    default: {
        name: 'default',
        description: 'Slot for notification contents',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    onClose: {
        name: 'close',
        description: 'Event emitted when the close button is clicked',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
});
