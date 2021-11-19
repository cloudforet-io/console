import { ArgTypes } from '@storybook/addons';
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
    href: {
        name: 'href',
        type: { name: 'string' },
        description: 'Href of button',
        defaultValue: 'https://www.google.com/',
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
    outline: {
        name: 'outline',
        type: { name: 'boolean' },
        description: 'Outlined when true',
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
    fontWeight: {
        name: 'fontWeight',
        type: { name: 'string' },
        description: 'Font Weight',
        defaultValue: 'bold',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'bold',
            },
        },
        control: {
            type: 'select',
            options: ['light', 'normal', 'bold'],
        },
    },
    onClick: {
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
