import type { ArgTypes, Parameters, Args } from '@storybook/vue';



export const getScopedNotificationArgs = (): Args => ({
    type: 'info',
    layout: 'full-width',
    icon: 'ic_info-circle',
    title: 'Title',
    showCloseButton: false,
    visible: true,
});

export const getScopedNotificationParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/design/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=14187-508203&t=fZtZFd6u3OSbrYdh-4',
    },
});

export const getScopedNotificationArgTypes = (): ArgTypes => ({
    type: {
        name: 'type',
        type: { name: 'string' },
        description: 'Type of the notification.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'tip',
            },
        },
        control: 'select',
        options: ['information', 'danger', 'warning', 'success', 'discovery', 'tip'],
    },
    layout: {
        name: 'layout',
        type: { name: 'string' },
        description: 'Layout of the notification.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'full-width',
            },
        },
        control: 'select',
        options: ['full-width', 'in-section'],
    },
    icon: {
        name: 'icon',
        type: { name: 'string' },
        description: 'Icon of the notification.',
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
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'Title of the notification.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Title',
            },
        },
        control: 'text',
    },
    showCloseButton: {
        name: 'showCloseButton',
        type: { name: 'boolean' },
        description: 'Show close button.',
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
    visible: {
        name: 'visible',
        type: { name: 'boolean' },
        description: 'Show notification.',
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
    // events
    'update:visible': { table: { disable: true } },
    close: { table: { disable: true } },
});
