import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import {
    BADGE_FONT_WEIGHT, BADGE_SHAPE, BADGE_STYLE_TYPE, BADGE_TYPE,
} from '@/data-display/badge/type';

export const getBadgesArgs = (): Args => ({
    badgeType: BADGE_TYPE.SOLID,
    styleType: BADGE_STYLE_TYPE.primary,
    textColor: null,
    backgroundColor: null,
    outlineColor: null,
    shape: BADGE_SHAPE.ROUND,
    fontWeight: BADGE_FONT_WEIGHT.REGULAR,
    defaultSlot: 'badge',
});

export const getBadgesParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124077',
    },
});

export const getBadgesArgTypes = (): ArgTypes => ({
    badgeType: {
        name: 'badgeType',
        type: { name: 'string' },
        description: 'Badge type',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_TYPE.SOLID,
            },
        },
        control: 'select',
        options: Object.values(BADGE_TYPE),
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Badge style',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_STYLE_TYPE.primary,
            },
        },
        control: 'select',
        options: Object.values(BADGE_STYLE_TYPE),
    },
    textColor: {
        name: 'textColor',
        type: { name: 'string' },
        description: 'Text color of badge',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'color',
    },
    backgroundColor: {
        name: 'backgroundColor',
        type: { name: 'string' },
        description: 'Background color of badge',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'color',
    },
    outlineColor: {
        name: 'outlineColor',
        type: { name: 'string' },
        description: 'Outline color of badge.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'color',
    },
    shape: {
        name: 'shape',
        type: { name: 'string' },
        description: 'Shape of badge',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_SHAPE.ROUND,
            },
        },
        control: 'select',
        options: Object.values(BADGE_SHAPE),
    },
    fontWeight: {
        name: 'fontWeight',
        type: { name: 'string' },
        description: 'Font weight of badge',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: BADGE_FONT_WEIGHT.REGULAR,
            },
        },
        control: 'select',
        options: Object.values(BADGE_FONT_WEIGHT),
    },
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents of badge',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    // default
    default: { table: { disable: true } },
});
