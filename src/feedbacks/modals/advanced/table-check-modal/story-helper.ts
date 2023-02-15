import type { ArgTypes } from '@storybook/addons';

import { getUserFields, getUsers } from '@/data-display/tables/data-table/mock';
import { THEME_COLORS } from '@/feedbacks/modals/button-modal/type';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getTableCheckModalArgTypes = (): ArgTypes => ({
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
    subTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Sub title of modal.',
        defaultValue: 'This is sub title.',
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
    themeColor: {
        name: 'themeColor',
        type: { name: 'string' },
        description: `Modal themes. ${THEME_COLORS.map((d) => `\`${d}\``).join(', ')} are available.`,
        defaultValue: 'primary',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'primary',
            },
        },
        control: {
            type: 'select',
            options: THEME_COLORS,
        },
    },
    fields: {
        name: 'fields',
        type: { name: 'array', required: true },
        description: 'Table columns. Array of field type object or string.',
        defaultValue: getUserFields(),
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    items: {
        name: 'items',
        type: { name: 'array' },
        description: 'Table data array.',
        defaultValue: getUsers(),
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether to show loader or not.',
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
