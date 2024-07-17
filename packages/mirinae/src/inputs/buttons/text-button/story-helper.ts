import type { ArgTypes, Args } from '@storybook/vue';
import icon from 'vue-svgicon';

import { TEXT_BUTTON_SIZE, TEXT_BUTTON_STYLE } from '@/inputs/buttons/text-button/type';


export const getTextButtonDefaultArgs = (): Args => ({
    styleType: TEXT_BUTTON_STYLE.default,
    size: TEXT_BUTTON_SIZE.md,
    iconLeft: null,
    iconRight: null,
    loading: false,
    disabled: false,
    readonly: false,
    default: 'button',
    handleClick: "() => console.log('click')",
});

export const getTextButtonArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: 'string',
        description: 'Text button style',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: TEXT_BUTTON_STYLE.default,
            },
        },
        control: 'select',
        options: Object.values(TEXT_BUTTON_STYLE),
    },
    size: {
        name: 'size',
        type: 'string',
        description: 'Text button size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: TEXT_BUTTON_SIZE.md,
            },
        },
        control: 'select',
        options: Object.values(TEXT_BUTTON_SIZE),
    },
    iconLeft: {
        name: 'iconLeft',
        type: 'string',
        description: 'Name of icon to the left of the text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'select',
        options: [null, ...Object.keys(icon.icons)],
    },
    iconRight: {
        name: 'iconRight',
        type: 'string',
        description: 'Name of icon to the right of the text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'select',
        options: [null, ...Object.keys(icon.icons)],
    },
    loading: {
        name: 'loading',
        type: 'boolean',
        description: 'Loading when true',
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
    disabled: {
        name: 'disabled',
        type: 'boolean',
        description: 'Disabled when true',
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
    readonly: {
        name: 'readonly',
        type: 'boolean',
        description: 'Whether to make readonly or not',
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
    // slots
    default: {
        name: 'default',
        type: 'string',
        description: 'Slot for contents of text button.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    // events
    handleClick: {
        name: 'click',
        type: 'function',
        description: 'Click function',
        table: {
            type: {
                summary: null,
            },
            category: 'event',
        },
        control: 'text',
    },
});
