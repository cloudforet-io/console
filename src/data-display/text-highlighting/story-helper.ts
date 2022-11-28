import type { ArgTypes } from '@storybook/addons';

import { getTextHighlightingProps } from '@/data-display/text-highlighting/mock';
import { TEXT_HIGHLIGHTING_STYLE_TYPE } from '@/data-display/text-highlighting/type';

export const getTextHighlightingArgTypes = (): ArgTypes => {
    const { text, term } = getTextHighlightingProps();
    return {
        text: {
            name: 'text',
            type: { name: 'string' },
            description: 'Text to display.',
            defaultValue: text,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '""',
                },
            },
            control: {
                type: 'text',
            },
        },
        term: {
            name: 'term',
            type: { name: 'string' },
            description: 'Term to highlight.',
            defaultValue: term,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '""',
                },
            },
            control: {
                type: 'text',
            },
        },
        styleType: {
            name: 'styleType',
            type: { name: 'string' },
            description: `Style type.  ${TEXT_HIGHLIGHTING_STYLE_TYPE.map((d) => `\`${d}\``)} are available.`,
            defaultValue: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: TEXT_HIGHLIGHTING_STYLE_TYPE[0],
                },
            },
            control: {
                type: 'select',
                options: TEXT_HIGHLIGHTING_STYLE_TYPE,
            },
        },
        // slots
        defaultSlot: {
            name: 'default',
            description: 'Slot for each text.',
            defaultValue: null,
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
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
    };
};
