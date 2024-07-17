import type { SBType } from '@storybook/types';
import type { ArgTypes, Args } from '@storybook/vue';

export const getSelectButtonGroupDefaultArgs = (): Args => ({
    buttons: [
        {
            name: 'one',
            label: '첫번째',
        },
        {
            name: 'two',
            label: '두번째',
        },
        {
            name: 'three',
            label: '세번째',
        },
        {
            name: 'four',
            label: '네번째',
        },
    ],
    selected: 'one',
    theme: 'default',
});

export const getSelectButtonGroupArgTypes = (): ArgTypes => ({
    buttons: {
        name: 'buttons',
        type: { name: 'array' } as SBType,
        description: 'Object Array of buttons.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    selected: {
        name: 'selected',
        type: 'string',
        description: 'Selected button name.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'select',
        options: ['one', 'two', 'three', 'four'],
    },
    theme: {
        name: 'theme',
        type: 'string',
        description: 'Style theme of buttons.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'default',
            },
        },
        control: 'select',
        options: ['default', 'text'],
    },
});
