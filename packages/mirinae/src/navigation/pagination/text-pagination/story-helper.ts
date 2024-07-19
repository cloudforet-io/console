import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getTextPaginationArgs = (): Args => ({
    thisPage: 1,
    allPage: undefined,
    showPageNumber: true,
    disableNextPage: false,
    hasNextPage: false,
    defaultSlot: '',
});

export const getTextPaginationParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A178955',
    },
});

export const getTextPaginationArgTypes = (): ArgTypes => ({
    thisPage: {
        name: 'thisPage',
        description: 'Current page number.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'number',
    },
    allPage: {
        name: 'allPage',
        description: 'Total page number.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'number',
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
        control: 'boolean',
    },
    disableNextPage: {
        name: 'disableNextPage',
        type: { name: 'boolean' },
        description: 'This prop used only for "only this page number". When allPage is undefined, you can use disableNextPage to activate the next icons',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    hasNextPage: {
        name: 'hasNextPage',
        type: { name: 'boolean' },
        description: 'Whether to show indication that there is next page or not. It cannot be used with allPage prop.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot to customize page contents area.',
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
