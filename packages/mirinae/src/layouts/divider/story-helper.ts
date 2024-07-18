import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getDividerParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6980%3A163403',
    },
});

export const getDividerArgs = (): Args => ({
    vertical: false,
});

export const getDividerArgTypes = (): ArgTypes => ({
    vertical: {
        name: 'vertical',
        type: 'boolean',
        description: 'Is vertical divider or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
});
