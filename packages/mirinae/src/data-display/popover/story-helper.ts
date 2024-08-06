import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { POPOVER_PLACEMENT, POPOVER_TRIGGER } from '@/data-display/popover/type';

export const getPopoverArgs = (): Args => ({
    isVisible: false,
    tag: 'span',
    position: POPOVER_PLACEMENT.BOTTOM_END,
    trigger: POPOVER_TRIGGER.CLICK,
    ignoreTargetClick: true,
    ignoreOutsideClick: false,
    hidePadding: false,
    hideCloseButton: false,
    hideArrow: false,
    'v-model': false,
    defaultSlot: null,
    contentRefSlot: null,
});

export const getPopoverParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=2667%3A173604',
    },
});

export const getPopoverArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
        // props
        isVisible: {
            name: 'isVisible',
            type: { name: 'boolean' },
            description: 'Whether to show popover or not. support two way binding with `sync`.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        tag: {
            name: 'tag',
            type: { name: 'string' },
            description: 'root element tag',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'span',
                },
            },
            control: 'text',
        },
        position: {
            name: 'position',
            type: { name: 'string' },
            description: `Select popover placement. ${
                [...Object.values(POPOVER_PLACEMENT)].map((d) => `\`${d}\``)} are available.`,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'bottom-end',
                },
            },
            control: 'select',
            options: [...Object.values(POPOVER_PLACEMENT)],
        },
        trigger: {
            name: 'trigger',
            type: { name: 'string' },
            description: `Select popover trigger. ${
                [...Object.values(POPOVER_TRIGGER)].map((d) => `\`${d}\``)} are available.`,
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
            options: [...Object.values(POPOVER_TRIGGER)],
        },
        ignoreTargetClick: {
            name: 'ignoreTargetClick',
            type: { name: 'boolean' },
            description: 'If the value is true, Ignore element click events assigned to the default slot.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: true,
                },
            },
            control: 'boolean',
        },
        ignoreOutsideClick: {
            name: 'ignoreOutsideClick',
            type: { name: 'boolean' },
            description: 'If the value is true, do not close the popover even if user click outside the popover.',
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
        hidePadding: {
            name: 'hidePadding',
            type: { name: 'boolean' },
            description: 'If the value is true, do not apply padding to the popover.',
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
        hideCloseButton: {
            name: 'hideCloseButton',
            type: { name: 'boolean' },
            description: 'If the value is true, hide the close button.',
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
        hideArrow: {
            name: 'hideArrow',
            type: { name: 'boolean' },
            description: 'If the value is true, hide the arrow.',
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
        // model
        'v-model': {
            name: 'v-model',
            type: { name: 'boolean' },
            required: false,
            description: 'Two way binding for `isVisible` props with `update:isVisible` event.',
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
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'slots',
            },
            control: 'text',
        },
        contentRefSlot: {
            name: 'content',
            description: 'Slot for content.',
            type: { name: 'string' },
            table: {
                type: {
                    summary: null,
                },
                category: 'slots',
            },
            control: 'text',
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
        'onUpdate:is-visible': {
            name: 'update:is-visible',
            description: 'Emitted when the popover visibility is updated. Event parameter - `visible: boolean`',
            table: {
                type: {
                    summary: null,
                },
                category: 'events',
            },
        },
        // default
        default: { table: { disable: true } },
        content: { table: { disable: true } },
    };

    return argTypes;
};
