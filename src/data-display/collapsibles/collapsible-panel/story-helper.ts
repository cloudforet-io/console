import { ArgTypes } from '@storybook/addons';
import faker from 'faker';
import { argTypes as collapsibleArgTypes } from '@/hooks/collapsible/story-helper';


export const argTypes: ArgTypes = {
    ...collapsibleArgTypes,
    lineClamp: {
        name: 'lineClamp',
        type: { name: 'number' },
        description: 'It refers to the number of content lines to be displayed in the collapsed state.',
        defaultValue: 2,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 2,
            },
        },
        control: {
            type: 'number',
        },
    },
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents.',
        defaultValue: faker.lorem.sentence(40),
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
