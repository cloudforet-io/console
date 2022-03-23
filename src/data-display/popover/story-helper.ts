import { ArgTypes } from '@storybook/addons';
import { POPOVER_PLACEMENT } from '@/data-display/popover/type';

export const getPopoverArgTypes = () => {
    const argTypes: ArgTypes = {
        position: {
            name: 'position',
            type: { name: 'string' },
            description: `Select popover placement. ${
                [...Object.values(POPOVER_PLACEMENT)].map(d => `\`${d}\``)} are available.`,
            defaultValue: POPOVER_PLACEMENT.BOTTOM,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'default',
                },
            },
            control: {
                type: 'select',
                options: [undefined, ...Object.values(POPOVER_PLACEMENT)],
            },
        },
        isVisible: {
            name: 'isVisible',
            type: { name: 'boolean' },
            description: 'Setting whether tooltip is visible.',
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
        defaultSlot: {
            name: 'default',
            description: 'Slot of components to which popover will be applied.',
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
    };
    return argTypes;
};
