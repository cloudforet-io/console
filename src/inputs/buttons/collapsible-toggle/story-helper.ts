import { ArgTypes } from '@storybook/addons';
import { argTypes as collapsibleArgTypes } from '@/hooks/collapsible/story-helper';

export const argTypes: ArgTypes = {
    ...collapsibleArgTypes,
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for toggle button contents.',
        defaultValue: 'Show',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
};
