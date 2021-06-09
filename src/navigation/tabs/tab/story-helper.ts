import { ArgTypes } from '@storybook/addons';
import { argTypes as tabArgTypes, Inner } from '@/hooks/tab/story-helper';

export const argTypes: ArgTypes = {
    ...tabArgTypes,
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
};


export { Inner };
