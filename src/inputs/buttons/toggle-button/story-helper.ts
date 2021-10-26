import { ArgTypes } from '@storybook/addons';
import { TOGGLE_BUTTON_THEME } from '@/inputs/buttons/toggle-button/config';


export const getToggleButtonArgTypes = (): ArgTypes => ({
    sync: {
        name: 'sync',
        type: { name: 'boolean' },
        description: 'If set to true, will be watching changes in value property and overwrite the current state of the button whenever value prop changes',
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
    value: {
        name: 'value',
        type: { name: 'boolean' },
        description: 'Initial State of the toggle button.',
        defaultValue: true,
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
    theme: {
        name: 'theme',
        type: { name: 'string' },
        description: 'Style theme of toggle button.',
        defaultValue: TOGGLE_BUTTON_THEME.secondary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: TOGGLE_BUTTON_THEME.secondary,
            },
        },
        control: {
            type: 'select',
            options: Object.keys(TOGGLE_BUTTON_THEME),
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
});
