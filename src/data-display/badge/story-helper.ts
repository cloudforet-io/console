import type { ArgTypes } from '@storybook/addons';

import { BADGE_SHAPE, BADGE_STYLE } from '@/data-display/badge/type';


export const getBadgesArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Badge style',
        defaultValue: BADGE_STYLE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_STYLE.primary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BADGE_STYLE),
        },
    },
    textColor: {
        name: 'textColor',
        type: { name: ' string' },
        description: 'Text color of badge',
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
            type: 'color',
        },
    },
    backgroundColor: {
        name: 'backgroundColor',
        type: { name: 'string' },
        description: 'Background color of badge',
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
            type: 'color',
        },
    },
    shape: {
        name: 'shape',
        type: { name: 'string' },
        description: 'Shape of badge',
        defaultValue: BADGE_SHAPE.ROUND,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_SHAPE.ROUND,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BADGE_SHAPE),
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
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents of badge',
        defaultValue: 'badge',
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
