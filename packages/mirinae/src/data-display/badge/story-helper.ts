import {
    BADGE_FONT_WEIGHT, BADGE_SHAPE, BADGE_STYLE_TYPE, BADGE_TYPE,
} from '@/data-display/badge/type';


export const getBadgesArgTypes = () => ({
    badgeType: {
        name: 'badgeType',
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
        description: 'Slot for contents of badge',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
});
