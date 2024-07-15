import {
    FIELD_TITLE_COLOR,
    FIELD_TITLE_SIZE,
    FIELD_TITLE_TEXT_WEIGHT,
} from '@/data-display/field-title/config';

export const getLabelArgTypes = () => ({
    label: {
        name: 'label',
        type: 'string',
        description: 'text to display.',
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
    description: {
        name: 'description',
        type: 'string',
        description: 'description for the title.',
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
    size: {
        name: 'size',
        type: 'string',
        description: 'size of field title label.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: FIELD_TITLE_SIZE.md,
            },
        },
        control: 'select',
        options: Object.keys(FIELD_TITLE_SIZE),
    },
    fontWeight: {
        name: 'fontWeight',
        type: 'string',
        description: 'font weight of field title label.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: FIELD_TITLE_TEXT_WEIGHT.bold,
            },
        },
        control: 'select',
        options: Object.keys(FIELD_TITLE_TEXT_WEIGHT),
    },
    color: {
        name: 'color',
        type: 'string',
        description: 'color of field title label.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: FIELD_TITLE_COLOR.dark,
            },
        },
        control: 'select',
        options: Object.keys(FIELD_TITLE_COLOR),
    },
    inline: {
        name: 'inline',
        type: 'boolean',
        description: 'Whether to display the title in inline mode.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'boolean',
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for field-title.',
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
    leftSlot: {
        name: 'left',
        description: 'Left side slot for field-title.',
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
    bottomSlot: {
        name: 'bottom',
        description: 'Bottom side slot for field-title.',
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
