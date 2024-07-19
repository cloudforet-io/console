import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { CARD_STYLE_TYPE, CARD_SIZE } from '@/data-display/cards/card/config';

export const getCardArgs = (): Args => ({
    header: 'This is header!',
    styleType: CARD_STYLE_TYPE.gray100,
    size: CARD_SIZE.md,
    defaultSlot: 'This is card body!',
    headerSlot: '',
});

export const getCardParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getCardArgTypes = (): ArgTypes => ({
    header: {
        name: 'header',
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    // default
    default: { table: { disable: true } },
});
