import { ArgTypes } from '@storybook/addons';
import { getTabHookArgTypes, Inner } from '@/hooks/tab/story-helper';

export const getTabArgTypes = (): ArgTypes => ({
    ...getTabHookArgTypes(),
    stretch: {
        name: 'stretch',
        type: { name: 'boolean' },
        description: 'Whether to stretch tab items or not.',
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
    /* slots */
    extraSlot: {
        name: 'extra',
        description: 'Use it to insert something to right extra space of every tab.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
});


export { Inner };
