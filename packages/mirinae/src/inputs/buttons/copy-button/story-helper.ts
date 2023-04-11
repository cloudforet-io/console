import type { ArgTypes } from '@storybook/addons';

import { SIZE } from '@/inputs/buttons/copy-button/type';

export const getCopyButtonArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        type: { name: 'string' },
        description: 'Text to be copied',
        defaultValue: 'Please, place any string to copy by button next to.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: {
            type: 'text',
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'Copy button size',
        defaultValue: SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SIZE.md,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SIZE),
        },
    },
    autoHideIcon: {
        name: 'autoHideIcon',
        type: { name: 'boolean' },
        description: 'Whether to auto hide icon when there is not text to copy or not.',
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
    copyManually: {
        name: 'copyManually',
        type: { name: 'boolean' },
        description: 'Whether to copy manually by event or not. When it is `true`, this component just emit `copy` event, and do nothing.',
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
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for contents of copy button',
        defaultValue: 'Please, place any string to copy by button next to.',
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
    onCopy: {
        name: 'copy',
        description: 'Event emitted when clicked copy button. Only works when `copyManually` props is `true`. Please, place any string to copy by button next to.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
        control: null,
    },
    onCopied: {
        name: 'copied',
        description: 'Event emitted when actually copy happened. Only works when there is text for copy to clipboard in slot or `value` props. Please, place any string to copy by button next to.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
        control: null,
    },
});
