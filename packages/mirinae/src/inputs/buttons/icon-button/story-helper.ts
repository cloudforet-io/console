import type { ArgTypes, Args, Parameters } from '@storybook/vue';
import icon from 'vue-svgicon';

import { ANIMATION_TYPE } from '@/foundation/icons/config';
import { ICON_BUTTON_SHAPE, ICON_BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';

export const getIconButtonArgs = (): Args => ({
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

export const getIconButtonParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5110%3A120777',
    },
});

export const getIconButtonArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    activated: {
        name: 'activated',
        type: { name: 'boolean' },
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
        type: { name: 'boolean' },
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
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
