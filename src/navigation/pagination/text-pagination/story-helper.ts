import { ArgTypes } from '@storybook/addons';

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
        defaultValue: 3,
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
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
});
