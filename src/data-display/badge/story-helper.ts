import type { ArgTypes } from '@storybook/addons';

import { BADGE_SHAPE, BADGE_STYLE_TYPE, BADGE_TYPE } from '@/data-display/badge/type';


export const getBadgesArgTypes = (): ArgTypes => ({
    badgeType: {
        name: 'badgeType',
        type: { name: 'string' },
        description: 'Badge type',
        defaultValue: BADGE_TYPE.SOLID,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_TYPE.SOLID,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BADGE_TYPE),
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Badge style',
        defaultValue: BADGE_STYLE_TYPE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_STYLE_TYPE.primary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BADGE_STYLE_TYPE),
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
    outlineColor: {
        name: 'outlineColor',
        type: { name: 'string' },
        description: 'Outline color of badge.',
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
