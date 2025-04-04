import type { ArgTypes, Args, Parameters } from '@storybook/vue';
import icon from 'vue-svgicon';

import { BUTTON_STYLE } from '@/controls/buttons/button/type';

export const getButtonArgs = (): Args => ({
    styleType: BUTTON_STYLE.primary,
    size: 'md',
    href: 'https://cloudforet.io',
    disabled: false,
    readonly: false,
    loading: false,
    block: false,
    iconLeft: null,
    iconRight: null,
    active: false,
    default: 'button',
    handleClick: "() => console.log('click')",
});

export const getButtonParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5152%3A122457',
    },
});

export const getButtonArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'boolean' },
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
        type: { name: 'boolean' },
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
        type: { name: 'boolean' },
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
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    active: {
        name: 'active',
        type: { name: 'boolean' },
        description: 'Active state when true',
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
        type: { name: 'string' },
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
        type: { name: 'function' },
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
