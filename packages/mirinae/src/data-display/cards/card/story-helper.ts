import type { ArgTypes } from '@storybook/addons';

import { CARD_STYLE_TYPE, CARD_SIZE } from '@/data-display/cards/card/config';

export const getCardArgTypes = (): ArgTypes => ({
    header: {
        name: 'header',
        type: { name: 'string, boolean' },
        description: 'Card header',
        defaultValue: 'This is header!',
        table: {
            type: {
                summary: 'string, boolean',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'object',
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Card style types. ${Object.values(CARD_STYLE_TYPE)} are available.`,
        defaultValue: CARD_STYLE_TYPE.gray100,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${CARD_STYLE_TYPE.gray100}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(CARD_STYLE_TYPE),
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Card size. ${Object.values(CARD_SIZE)} are available.`,
        defaultValue: CARD_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${CARD_SIZE.md}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(CARD_SIZE),
        },
    },
    defaultSlot: {
        name: 'default',
        description: 'Slot for card body.',
        defaultValue: 'This is card body!',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    headerSlot: {
        name: 'header',
        description: 'Slot for card header.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
});
