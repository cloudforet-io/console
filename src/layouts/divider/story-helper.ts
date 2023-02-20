import type { ArgTypes } from '@storybook/addons';

export const getDividerArgTypes = (): ArgTypes => ({
    vertical: {
        name: 'vertical',
        type: { name: 'boolean' },
        description: 'Is vertical divider or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
});
