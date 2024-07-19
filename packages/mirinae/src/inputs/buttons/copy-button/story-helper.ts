import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { SIZE } from '@/inputs/buttons/copy-button/type';

export const getCopyButtonArgs = (): Args => ({
    value: 'Please, place any string to copy by button next to.',
    size: SIZE.md,
    autoHideIcon: false,
    copyManually: false,
    defaultSlot: 'Please, place any string to copy by button next to.',
});

export const getCopyButtonParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=8075%3A2235',
    },
});

export const getCopyButtonArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        type: { name: 'string' },
        description: 'Text to be copied',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'text',
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'Copy button size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SIZE.md,
            },
        },
        control: 'select',
        options: Object.values(SIZE),
    },
    autoHideIcon: {
        name: 'autoHideIcon',
        type: { name: 'boolean' },
        description: 'Whether to auto hide icon when there is not text to copy or not.',
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
    copyManually: {
        name: 'copyManually',
        type: { name: 'boolean' },
        description: 'Whether to copy manually by event or not. When it is `true`, this component just emit `copy` event, and do nothing.',
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
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for contents of copy button',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
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
    // default
    default: { table: { disable: true } },
});
