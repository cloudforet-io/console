import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getPaginationArgs = (): Args => ({
    thisPage: 1,
    pageSize: 3,
    totalCount: 53,
});

export const getPaginationParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getPaginationArgTypes = (): ArgTypes => ({
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'Pagination size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: 'select',
        options: ['md', 'sm'],
    },
    thisPage: {
        name: 'thisPage',
        type: { name: 'number' },
        description: 'This represents current page number.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'number',
    },
    pageSize: {
        name: 'pageSize',
        type: { name: 'number' },
        description: 'Size of per page.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'number',
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        description: 'Total page number.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'number',
    },
});
