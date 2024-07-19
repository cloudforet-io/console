import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import {
    TOGGLE_BUTTON_POSITION,
    TOGGLE_BUTTON_SPACING,
} from '@/inputs/buttons/toggle-button/config';

export const getToggleButtonArgs = (): Args => ({
    value: false,
    showStateText: false,
    trueStateText: 'ON',
    falseStateText: 'OFF',
    readOnly: false,
    position: 'right',
    spacing: 'sm',
    disabled: false,
});

export const getToggleButtonParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5131%3A127311',
    },
});

export const getToggleButtonArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        type: { name: 'boolean' },
        description: 'Determine whether the toggle button is checked.',
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
    showStateText: {
        name: 'showStateText',
        type: { name: 'boolean' },
        description: 'Determine whether the toggle button state text is checked.',
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
    trueStateText: {
        name: 'trueStateText',
        type: { name: 'string' },
        description: 'StateText when toggle is true',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ON',
            },
        },
        control: 'text',
    },
    falseStateText: {
        name: 'falseStateText',
        type: { name: 'string' },
        description: 'StateText when toggle is false',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'OFF',
            },
        },
        control: 'text',
    },
    readOnly: {
        name: 'readOnly',
        type: { name: 'boolean' },
        description: 'Button does not react on mouse events, and show only state text',
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
    position: {
        name: 'position',
        type: { name: 'string' },
        description: 'StateText position',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'right',
            },
        },
        control: 'select',
        options: Object.keys(TOGGLE_BUTTON_POSITION),
    },
    spacing: {
        name: 'spacing',
        type: { name: 'string' },
        description: 'The spacing between toggle and stateText',
        defaultValue: 'sm',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'select',
        options: Object.keys(TOGGLE_BUTTON_SPACING),
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Button does not react on mouse events',
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
    // event
    onChange: {
        name: 'change-toggle',
        description: 'Event emitted when the toggle is changed',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateValue: {
        name: 'update:value',
        description: 'Works with `v-model` and `value` props sync.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default value
    'change-toggle': { table: { disable: true } },
    'update:value': { table: { disable: true } },
});
