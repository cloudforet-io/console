import type { ArgTypes } from '@storybook/addons';

import { THEME_COLORS } from '@/feedbacks/modals/button-modal/type';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getButtonModalArgTypes = (): ArgTypes => ({
    visible: {
        name: 'visible',
        type: { name: 'boolean', required: true },
        description: 'Whether to show modal or not. sync prop.',
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
    backdrop: {
        name: 'backdrop',
        type: { name: 'boolean' },
        description: 'Whether to show backdrop or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Modal size. ${Object.keys(SizeMapping).map((d) => `\`${d}\``).join(', ')} are available.`,
        defaultValue: 'md',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(SizeMapping),
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
    headerTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Header Title',
        defaultValue: 'Header Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Header Title',
            },
        },
        control: {
            type: 'text',
        },
    },
    hideHeader: {
        name: 'hideHeader',
        type: { name: 'boolean' },
        description: 'Whether to hide header or not.',
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
    hideBody: {
        name: 'hideBody',
        type: { name: 'boolean' },
        description: 'Whether to hide body or not.',
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
    hideFooter: {
        name: 'hideFooter',
        type: { name: 'boolean' },
        description: 'Whether to hide footer or not.',
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
    hideHeaderCloseButton: {
        name: 'hideHeaderCloseButton',
        type: { name: 'boolean' },
        description: 'Whether to hide close button in header or not.',
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
    footerResetButtonVisible: {
        name: 'footerResetButtonVisible',
        type: { name: 'boolean' },
        description: 'Whether to show reset button in footer or not.',
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
    hideFooterCloseButton: {
        name: 'hideFooterCloseButton',
        type: { name: 'boolean' },
        description: 'Whether to hide footer close button or not.',
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
    hideFooterConfirmButton: {
        name: 'hideFooterConfirmButton',
        type: { name: 'boolean' },
        description: 'Whether to hide footer confirm button or not.',
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
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Show Loading in confirm button',
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
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Disable confirm button or Not',
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
    absolute: {
        name: 'absolute',
        type: { name: 'number' },
        description: 'set position by absolute, with [{top: {absolute}rem}, {left: {absolute}rem}]',
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
        },
    },
    // model
    'v-model': {
        name: 'v-model',
        type: { name: 'boolean', required: false },
        description: 'Two way binding for `visible` props with `update:visible` event.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'model',
            defaultValue: {
                summary: false,
            },
        },
        control: null,
    },
    // slots
    header: {
        name: 'header',
        description: 'Slot for header',
        defaultValue: 'Modal Header',
        table: {
            type: {
                summary: 'Modal Header',
            },
            category: 'slots',
            defaultValue: 'Modal Header',
        },
    },
    body: {
        name: 'body',
        description: 'Slot for body content',
        defaultValue: 'Modal Content',
        table: {
            type: {
                summary: 'Modal Content',
            },
            category: 'slots',
            defaultValue: 'Modal Content',
        },
    },
    'footer-extra': {
        name: 'footer-extra',
        description: 'Slot for Extra contents in Footer',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: null,
        },
    },
    'reset-button': {
        name: 'reset-button',
        description: 'Slot for changing text in reset button',
        defaultValue: 'Reset',
        table: {
            type: {
                summary: 'Reset',
            },
            category: 'slots',
            defaultValue: 'Reset',
        },
    },
    'close-button': {
        name: 'cancel-button',
        description: 'Slot for changing text in cancel button',
        defaultValue: 'Cancel',
        table: {
            type: {
                summary: 'Cancel',
            },
            category: 'slots',
            defaultValue: 'Cancel',
        },
    },
    'confirm-button': {
        name: 'confirm-button',
        description: 'Slot for changing text in confirm button',
        defaultValue: 'Confirm',
        table: {
            type: {
                summary: 'Confirm',
            },
            category: 'slots',
            defaultValue: 'Confirm',
        },
    },
});
