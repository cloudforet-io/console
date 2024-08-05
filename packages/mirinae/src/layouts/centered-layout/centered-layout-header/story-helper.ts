import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getCenteredLayoutHeaderArgs = (): Args => ({
    title: 'Title',
    description: 'Description',
    showCloseButton: false,
    showStep: false,
    currentStep: 1,
    totalSteps: 3,
});

export const getCenteredLayoutHeaderParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A228226&t=GVsFwo5txLv6VtoA-4',
    },
});

export const getCenteredLayoutHeaderArgTypes = (): ArgTypes => ({
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    description: {
        name: 'description',
        type: { name: 'string' },
        description: 'Description',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    showCloseButton: {
        name: 'showCloseButton',
        type: { name: 'boolean' },
        description: 'Whether to show close button',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'boolean',
    },
    showStep: {
        name: 'showStep',
        type: { name: 'boolean' },
        description: 'Whether to show step',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'boolean',
    },
    currentStep: {
        name: 'currentStep',
        type: { name: 'number' },
        description: 'The current step',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'number',
    },
    totalSteps: {
        name: 'totalSteps',
        type: { name: 'number' },
        description: 'Total steps',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'number',
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
    // default
    close: { table: { disable: true } },
});
