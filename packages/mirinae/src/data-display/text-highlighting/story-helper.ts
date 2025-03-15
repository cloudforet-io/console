import type { ArgTypes } from '@storybook/vue';

import { getTextHighlightingProps } from '@/data-display/text-highlighting/mock';
import { TEXT_HIGHLIGHTING_STYLE_TYPE } from '@/data-display/text-highlighting/type';

export const getTextHighlightingArgs = () => {
    const { text, term } = getTextHighlightingProps();

    return {
        text,
        term,
        styleType: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
        defaultSlot: null,
        onNativeEvents: null,
    };
};

export const getTextHighlightingParameters = () => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getTextHighlightingArgTypes = (): ArgTypes => ({
    text: {
        name: 'text',
        type: { name: 'string' },
        description: 'Text to display.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    term: {
        name: 'term',
        type: { name: 'string' },
        description: 'Term to highlight.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Style type.  ${TEXT_HIGHLIGHTING_STYLE_TYPE.map((d) => `\`${d}\``)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
            },
        },
        control: 'select',
        options: TEXT_HIGHLIGHTING_STYLE_TYPE,
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for each text.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    // events
    onNativeEvents: {
        name: 'all native events',
        description: 'All native events are available for the root element(span).',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    default: { table: { disable: true } },
});
