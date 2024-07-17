import type { ArgTypes, Args } from '@storybook/vue';
import icon from 'vue-svgicon';

import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getButtonDefaultArgs = (): Args => ({
    styleType: BUTTON_STYLE.primary,
    size: 'md',
    href: 'https://cloudforet.io',
    disabled: false,
    readonly: false,
    loading: false,
    block: false,
    iconLeft: undefined,
    iconRight: undefined,
    default: 'button',
    handleClick: () => console.log('click'),
});

export const getButtonArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: 'string',
        description: 'Button style',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BUTTON_STYLE.primary,
            },
        },
        control: 'select',
        options: Object.values(BUTTON_STYLE),
    },
    size: {
        name: 'size',
        type: 'string',
        description: 'Button size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: 'select',
        options: ['md', 'sm', 'lg'],
    },
    href: {
        name: 'href',
        type: 'string',
        description: 'Href of button',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'text',
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
    block: {
        name: 'block',
        type: 'boolean',
        description: 'Width became 100% when true',
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
    // slots
    default: {
        name: 'default',
        type: 'string',
        description: 'Slot for contents of button',
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
