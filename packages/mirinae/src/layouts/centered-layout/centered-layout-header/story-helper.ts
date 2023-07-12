import type { ArgTypes } from '@storybook/addons';

export const getCenteredLayoutHeaderArgTypes = (): ArgTypes => ({
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'Title',
        defaultValue: 'Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'text',
        },
    },
    description: {
        name: 'description',
        type: { name: 'string' },
        description: 'Description',
        defaultValue: 'Description',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'text',
        },
    },
    showCloseButton: {
        name: 'showCloseButton',
        type: { name: 'boolean' },
        description: 'Whether to show close button',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    showStep: {
        name: 'showStep',
        type: { name: 'boolean' },
        description: 'Whether to show step',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    currentStep: {
        name: 'currentStep',
        type: { name: 'number' },
        description: 'The current step',
        defaultValue: 1,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    totalSteps: {
        name: 'totalSteps',
        type: { name: 'number' },
        description: 'Total steps',
        defaultValue: 3,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    // events
    onClose: {
        name: 'close',
        description: 'Event emitted when the close button is clicked.',
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
