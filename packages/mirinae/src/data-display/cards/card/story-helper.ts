import { CARD_STYLE_TYPE, CARD_SIZE } from '@/data-display/cards/card/config';

export const getCardArgTypes = () => ({
    header: {
        name: 'header',
        type: 'string, boolean',
        description: 'Card header',
        table: {
            type: {
                summary: 'string, boolean',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'object',
    },
    styleType: {
        name: 'styleType',
        type: 'string',
        description: `Card style types. ${Object.values(CARD_STYLE_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${CARD_STYLE_TYPE.gray100}"`,
            },
        },
        control: 'select',
        options: Object.values(CARD_STYLE_TYPE),
    },
    size: {
        name: 'size',
        type: 'string',
        description: `Card size. ${Object.values(CARD_SIZE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${CARD_SIZE.md}"`,
            },
        },
        control: 'select',
        options: Object.values(CARD_SIZE),
    },
    defaultSlot: {
        name: 'default',
        description: 'Slot for card body.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    headerSlot: {
        name: 'header',
        description: 'Slot for card header.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
});
