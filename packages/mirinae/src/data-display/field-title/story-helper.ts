import type { ArgTypes } from '@storybook/addons';

import {
    FIELD_TITLE_COLOR,
    FIELD_TITLE_SIZE,
    FIELD_TITLE_TEXT_WEIGHT,
} from '@/data-display/field-title/config';

export const getLabelArgTypes = (): ArgTypes => ({
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'text to display.',
        defaultValue: 'Field Title',
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
    description: {
        name: 'description',
        type: { name: 'string' },
        description: 'description for the title.',
        defaultValue: 'description for the title!',
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
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'size of field title label.',
        defaultValue: FIELD_TITLE_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: FIELD_TITLE_SIZE.md,
            },
        },
        control: {
            type: 'select',
            options: Object.keys(FIELD_TITLE_SIZE),
        },
    },
    fontWeight: {
        name: 'fontWeight',
        type: { name: 'string' },
        description: 'font weight of field title label.',
        defaultValue: FIELD_TITLE_TEXT_WEIGHT.bold,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: FIELD_TITLE_TEXT_WEIGHT.bold,
            },
        },
        control: {
            type: 'select',
            options: Object.keys(FIELD_TITLE_TEXT_WEIGHT),
        },
    },
    color: {
        name: 'color',
        type: { name: 'string' },
        description: 'color of field title label.',
        defaultValue: FIELD_TITLE_COLOR.dark,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: FIELD_TITLE_COLOR.dark,
            },
        },
        control: {
            type: 'select',
            options: Object.keys(FIELD_TITLE_COLOR),
        },
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for field-title.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    leftSlot: {
        name: 'left',
        description: 'Left side slot for field-title.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    rightSlot: {
        name: 'right',
        description: 'Right side slot for field-title.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    buttonSlot: {
        name: 'button',
        description: 'Button side slot for field-title.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
});
