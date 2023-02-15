import type { ArgTypes } from '@storybook/addons';

import { SizeMapping } from '@/feedbacks/modals/type';

export const getDoubleCheckModalArgTypes = (): ArgTypes => ({
    modalSize: {
        name: 'modalSize',
        type: { name: 'string' },
        description: 'Size of modal.',
        defaultValue: 'md',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"md"',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(SizeMapping),
        },
    },
    visible: {
        name: 'visible',
        type: { name: 'boolean' },
        description: 'Whether to show modal or not.',
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
    headerTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Header title of modal.',
        defaultValue: 'This is header title.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: {
            type: 'text',
        },
    },
    verificationText: {
        name: 'verificationText',
        type: { name: 'string' },
        description: 'Verification text.',
        defaultValue: 'verification',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"null"',
            },
        },
        control: {
            type: 'text',
        },
    },

    // slots
    defaultSlot: {
        name: 'default',
        description: '',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },


    // events
    onConfirm: {
        name: 'confirm',
        description: 'Emitted when confirm button is clicked.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onCancel: {
        name: 'cancel',
        description: 'Emitted when click cancel button or close button',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
