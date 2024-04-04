import type { ArgTypes } from '@storybook/addons';

export const getTextPaginationArgTypes = (): ArgTypes => ({
    thisPage: {
        name: 'thisPage',
        description: 'Current page number.',
        defaultValue: 1,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    allPage: {
        name: 'allPage',
        description: 'Total page number.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    showPageNumber: {
        name: 'showPageNumber',
        type: { name: 'boolean' },
        description: 'Whether to show page number or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    disableNextPage: {
        name: 'disableNextPage',
        type: { name: 'boolean' },
        description: 'This prop used only for "only this page number". When allPage is undefined, you can use disableNextPage to activate the next icons',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    hasNextPage: {
        name: 'hasNextPage',
        type: { name: 'boolean' },
        description: 'Whether to show indication that there is next page or not. It cannot be used with allPage prop.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot to customize page contents area.',
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
