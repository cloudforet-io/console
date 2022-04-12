import { ArgTypes } from '@storybook/addons';
import { POPOVER_PLACEMENT, POPOVER_TRIGGER } from '@/data-display/popover/type';

export const getPopoverArgTypes = () => {
    const argTypes: ArgTypes = {
        position: {
            name: 'position',
            type: { name: 'string' },
            description: `Select popover placement. ${
                [...Object.values(POPOVER_PLACEMENT)].map(d => `\`${d}\``)} are available.`,
            defaultValue: POPOVER_PLACEMENT.BOTTOM_END,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'bottom-end',
                },
            },
            control: {
                type: 'select',
                options: [...Object.values(POPOVER_PLACEMENT)],
            },
        },
        trigger: {
            name: 'trigger',
            type: { name: 'string' },
            description: `Select popover trigger. ${
                [...Object.values(POPOVER_TRIGGER)].map(d => `\`${d}\``)} are available.`,
            defaultValue: POPOVER_TRIGGER.CLICK,
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
                options: [...Object.values(POPOVER_TRIGGER)],
            },
        },
        ignoreTargetClick: {
            name: 'ignoreTargetClick',
            type: { name: 'boolean' },
            description: 'If the value is true, Ignore element click events assigned to the default slot.',
            defaultValue: true,
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: true,
                },
            },
            control: {
                type: 'boolean',
            },
        },
        defaultSlot: {
            name: 'default',
            description: 'Slot of components to which popover will be applied.',
            type: { name: 'string' },
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
            control: {
                type: 'text',
            },
        },
        contentRefSlot: {
            name: 'content',
            description: 'Slot for content.',
            type: { name: 'string' },
            defaultValue: null,
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
    return argTypes;
};
