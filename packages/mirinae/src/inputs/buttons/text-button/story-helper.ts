import type { ArgTypes } from '@storybook/addons';

import icons from '@/foundation/icons/p-icons/icons';
import { TEXT_BUTTON_SIZE, TEXT_BUTTON_STYLE } from '@/inputs/buttons/text-button/type';


export const getTextButtonArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Text button style',
        defaultValue: TEXT_BUTTON_STYLE.default,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: TEXT_BUTTON_STYLE.default,
            },
        },
        control: {
            type: 'select',
            options: Object.values(TEXT_BUTTON_STYLE),
        },
    },
    size: {
        name: 'size',
        type: { name: ' string' },
        description: 'Text button size',
        defaultValue: TEXT_BUTTON_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: TEXT_BUTTON_SIZE.md,
            },
        },
        control: {
            type: 'select',
            options: Object.values(TEXT_BUTTON_SIZE),
        },
    },
    iconLeft: {
        name: 'iconLeft',
        type: { name: 'string' },
        description: 'Name of icon to the left of the text.',
        defaultValue: null,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: {
            type: 'select',
            options: [null, ...Object.keys(icons)],
        },
    },
    iconRight: {
        name: 'iconRight',
        type: { name: 'string' },
        description: 'Name of icon to the right of the text.',
        defaultValue: null,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: {
            type: 'select',
            options: [null, ...Object.keys(icons)],
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Loading when true',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Disabled when true',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    readonly: {
        name: 'readonly',
        type: { name: 'boolean' },
        description: 'Whether to make readonly or not',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    // slots
    default: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents of text button.',
        defaultValue: 'button',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    // events
    handleClick: {
        name: 'click',
        type: { name: 'function' },
        description: 'Click function',
        defaultValue: "()=>{console.log('click')}",
        table: {
            type: {
                summary: null,
            },
            category: 'event',
        },
        control: {
            type: 'text',
        },
    },
});
