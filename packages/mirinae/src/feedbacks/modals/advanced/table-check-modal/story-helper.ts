import { getUserFields, getUsers } from '@/data-display/tables/data-table/mock';
import { THEME_COLORS } from '@/feedbacks/modals/button-modal/type';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getTableCheckModalDefaultArgs = () => ({
    modalSize: 'md',
    visible: false,
    headerTitle: 'This is header title.',
    subTitle: 'This is sub title.',
    themeColor: 'primary',
    fields: getUserFields(),
    items: getUsers(),
    loading: false,
    defaultSlot: undefined,
    subTitleSlot: undefined,
    subTitleFormatSlot: undefined,
    onConfirm: undefined,
});

export const getTableCheckModalArgTypes = () => ({
    modalSize: {
        name: 'modalSize',
        type: 'string',
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
        type: 'boolean',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'array',
        required: true,
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
        type: 'array',
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
        type: 'boolean',
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
});
