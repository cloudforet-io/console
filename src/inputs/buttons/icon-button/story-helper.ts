import type { ArgTypes } from '@storybook/addons';
import icon from 'vue-svgicon';

import { ANIMATION_TYPE } from '@/foundation/icons/config';
import { ICON_BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';


export const getIconButtonArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'Icon name',
        defaultValue: 'ic_refresh',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_refresh',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(icon.icons),
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Button style',
        defaultValue: ICON_BUTTON_STYLE_TYPE.transparent,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: ICON_BUTTON_STYLE_TYPE.transparent,
            },
        },
        control: {
            type: 'select',
            options: Object.values(ICON_BUTTON_STYLE_TYPE),
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
    activated: {
        name: 'activated',
        type: { name: 'boolean' },
        description: 'Activated when true (only works with gray-border style)',
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
        description: 'Whether to show loader or not.',
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
    color: {
        name: 'color',
        type: { name: 'string' },
        description: 'Color of icon',
        defaultValue: 'inherit',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'inherit',
            },
        },
        control: {
            type: 'text',
        },
    },
    animation: {
        name: 'animation',
        type: { name: 'string' },
        description: `Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'select',
            options: Object.values(ANIMATION_TYPE),
        },
    },
    // slots
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot to replace icon',
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
});
