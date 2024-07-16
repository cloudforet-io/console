import { getTextHighlightingProps } from '@/data-display/text-highlighting/mock';
import { TEXT_HIGHLIGHTING_STYLE_TYPE } from '@/data-display/text-highlighting/type';

export const getTextHighlightingDefaultArgs = () => {
    const { text, term } = getTextHighlightingProps();

    return {
        text,
        term,
        styleType: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
        defaultSlot: undefined,
        onNativeEvents: undefined,
    };
};

export const getTextHighlightingArgTypes = () => ({
    text: {
        name: 'text',
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
});
