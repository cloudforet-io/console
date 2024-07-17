import type { ArgTypes, Args } from '@storybook/vue';
import icon from 'vue-svgicon';

import { ANIMATION_TYPE } from '@/foundation/icons/config';
import { ICON_BUTTON_SHAPE, ICON_BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';

export const getIconButtonDefaultArgs = (): Args => ({
    name: 'ic_refresh',
    styleType: ICON_BUTTON_STYLE_TYPE.transparent,
    size: 'md',
    disabled: false,
    activated: false,
    loading: false,
    outline: false,
    color: 'inherit',
    animation: undefined,
    shape: ICON_BUTTON_SHAPE.circle,
    default: 'button',
});

export const getIconButtonArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: 'string',
        description: 'Icon name',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_refresh',
            },
        },
        control: 'select',
        options: Object.keys(icon.icons),
    },
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
                summary: ICON_BUTTON_STYLE_TYPE.transparent,
            },
        },
        control: 'select',
        options: Object.values(ICON_BUTTON_STYLE_TYPE),
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
    activated: {
        name: 'activated',
        type: 'boolean',
        description: 'Activated when true (only works with gray-border style)',
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
        description: 'Whether to show loader or not.',
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
    outline: {
        name: 'outline',
        type: 'boolean',
        description: 'Outlined when true',
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
    color: {
        name: 'color',
        type: 'string',
        description: 'Color of icon',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'inherit',
            },
        },
        control: 'text',
    },
    animation: {
        name: 'animation',
        type: 'string',
        description: `Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'select',
        options: Object.values(ANIMATION_TYPE),
    },
    shape: {
        name: 'shape',
        type: 'string',
        description: `Shape of icon button. ${Object.values(ICON_BUTTON_SHAPE).map((d) => `'${d}'`)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: ICON_BUTTON_SHAPE.circle,
            },
        },
        control: 'select',
        options: Object.values(ICON_BUTTON_SHAPE),
    },
    // slots
    default: {
        name: 'default',
        type: 'string',
        description: 'Slot to replace icon',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
});
