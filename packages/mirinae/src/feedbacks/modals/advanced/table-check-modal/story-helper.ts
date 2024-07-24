import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getUserFields, getUsers } from '@/data-display/tables/data-table/mock';
import { THEME_COLORS } from '@/feedbacks/modals/button-modal/type';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getTableCheckModalArgs = (): Args => ({
    modalSize: 'md',
    visible: false,
    headerTitle: 'This is header title.',
    subTitle: 'This is sub title.',
    themeColor: 'primary',
    fields: getUserFields(),
    items: getUsers(),
    loading: false,
    defaultSlot: null,
    subTitleSlot: null,
    subTitleFormatSlot: null,
    onConfirm: null,
    onCancel: null,
});

export const getTableCheckModalParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/t0napBIB14ZZN9RIq9uo3O/Asset-Inventory?node-id=2613%3A371966&t=0A8wuvLdPqlyb3TM-4',
    },
});

export const getTableCheckModalArgTypes = (): ArgTypes => ({
    modalSize: {
        name: 'modalSize',
        type: { name: 'string' },
        description: 'Size of modal.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"md"',
            },
        },
        control: 'select',
        options: Object.keys(SizeMapping),
    },
    visible: {
        name: 'visible',
        type: { name: 'boolean' },
        description: 'Whether to show modal or not.',
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
    headerTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Header title of modal.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: 'text',
    },
    subTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Sub title of modal.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: 'text',
    },
    themeColor: {
        name: 'themeColor',
        type: { name: 'string' },
        description: `Modal themes. ${THEME_COLORS.map((d) => `\`${d}\``).join(', ')} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'primary',
            },
        },
        control: 'select',
        options: THEME_COLORS,
    },
    fields: {
        name: 'fields',
        type: { name: 'array', required: true } as SBType,
        description: 'Table columns. Array of field type object or string.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    items: {
        name: 'items',
        type: { name: 'array' } as SBType,
        description: 'Table data array.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether to show loader or not.',
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

    // slots
    defaultSlot: {
        name: 'default',
        description: '',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    subTitleSlot: {
        name: 'sub-title',
        description: '',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    subTitleFormatSlot: {
        name: 'sub-title-format',
        description: '',
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
    // default
    'sub-title': { table: { disable: true } },
    'sub-title-format': { table: { disable: true } },
    default: { table: { disable: true } },
    slot: { table: { disable: true } },
});
