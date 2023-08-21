import type { ArgTypes } from '@storybook/addons';
import icon from 'vue-svgicon';

import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getButtonArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Button style',
        defaultValue: BUTTON_STYLE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BUTTON_STYLE.primary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BUTTON_STYLE),
        },
    },
    size: {
        name: 'size',
        type: { name: ' string' },
        description: 'Button size',
        defaultValue: 'md',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: {
            type: 'select',
            options: ['md', 'sm', 'lg'],
        },
    },
    href: {
        name: 'href',
        type: { name: 'string' },
        description: 'Href of button',
        defaultValue: 'https://cloudforet.io',
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
            type: 'text',
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
    block: {
        name: 'block',
        type: { name: 'boolean' },
        description: 'Width became 100% when true',
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
            options: [null, ...Object.keys(icon.icons)],
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
            options: [null, ...Object.keys(icon.icons)],
        },
    },
    // slots
    default: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents of button',
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
