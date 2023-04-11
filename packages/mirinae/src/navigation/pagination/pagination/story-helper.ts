import type { ArgTypes } from '@storybook/addons';

export const getPaginationArgTypes = (): ArgTypes => ({
    thisPage: {
        name: 'thisPage',
        type: { name: 'number' },
        description: 'This represents current page number.',
        defaultValue: 1,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'number',
        },
    },
    pageSize: {
        name: 'pageSize',
        type: { name: 'number' },
        description: 'Size of per page.',
        defaultValue: 3,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'number',
        },
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        description: 'Total page number.',
        defaultValue: 53,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'number',
        },
    },
});
