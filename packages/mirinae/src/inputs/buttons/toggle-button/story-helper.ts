import type { ArgTypes } from '@storybook/addons';

import {
    TOGGLE_BUTTON_POSITION,
    TOGGLE_BUTTON_SPACING,
} from '@/inputs/buttons/toggle-button/config';


export const getToggleButtonArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        type: { name: 'boolean' },
        description: 'Determine whether the toggle button is checked.',
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
    showStateText: {
        name: 'showStateText',
        type: { name: 'boolean' },
        description: 'Determine whether the toggle button state text is checked.',
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
    position: {
        name: 'position',
        type: { name: 'string' },
        description: 'StateText position',
        defaultValue: 'right',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'right',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(TOGGLE_BUTTON_POSITION),
        },
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
        control: {
            type: 'select',
            options: Object.keys(TOGGLE_BUTTON_SPACING),
        },
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Button does not react on mouse events',
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
});
