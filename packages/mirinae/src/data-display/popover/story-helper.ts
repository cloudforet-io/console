import type { ArgTypes } from '@storybook/addons';

import { POPOVER_PLACEMENT, POPOVER_TRIGGER } from '@/data-display/popover/type';

export const getPopoverArgTypes = () => {
    const argTypes: ArgTypes = {
        // props
        isVisible: {
            name: 'isVisible',
            type: { name: 'boolean' },
            description: 'Whether to show popover or not. support two way binding with `sync`.',
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
        tag: {
            name: 'tag',
            type: { name: 'string' },
            description: 'root element tag',
            defaultValue: 'span',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'span',
                },
            },
            control: {
                type: 'text',
            },
        },
        position: {
            name: 'position',
            type: { name: 'string' },
            description: `Select popover placement. ${
                [...Object.values(POPOVER_PLACEMENT)].map((d) => `\`${d}\``)} are available.`,
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
                [...Object.values(POPOVER_TRIGGER)].map((d) => `\`${d}\``)} are available.`,
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
        // model
        'v-model': {
            name: 'v-model',
            type: { name: 'boolean', required: false },
            description: 'Two way binding for `isVisible` props with `update:isVisible` event.',
            defaultValue: false,
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'model',
                defaultValue: {
                    summary: null,
                },
            },
            control: null,
        },
        // slots
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
        // events
        onClick: {
            name: 'click',
            description: 'Emitted when the trigger is clicked.',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        onMouseenter: {
            name: 'mouseenter',
            description: 'Emitted when the mouse is entered to the trigger.',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        onMouseleave: {
            name: 'mouseleave',
            description: 'Emitted when the mouse is leaved from the trigger.',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        onFocus: {
            name: 'focus',
            description: 'Emitted when the trigger is focused.',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        onBlur: {
            name: 'blur',
            description: 'Emitted when the trigger is blurred.',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        'onUpdate:isVisible': {
            name: 'update:is-visible',
            description: 'Emitted when the popover visibility is updated. Event parameter - `visible: boolean`',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
    };
    return argTypes;
};
