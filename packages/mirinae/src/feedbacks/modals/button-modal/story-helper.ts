import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { THEME_COLORS } from '@/feedbacks/modals/button-modal/type';
import { SizeMapping } from '@/feedbacks/modals/type';

export const getButtonModalArgs = (): Args => ({
    visible: false,
    backdrop: true,
    size: 'md',
    themeColor: 'primary',
    headerTitle: 'Header Title',
    hideHeader: false,
    hideBody: false,
    hideFooter: false,
    hideHeaderCloseButton: false,
    footerResetButtonVisible: false,
    hideFooterCloseButton: false,
    hideFooterConfirmButton: false,
    loading: false,
    disabled: false,
    absolute: 0,
    modalBodyId: undefined,
    'v-model': false,
    header: 'Modal Header',
    body: 'Modal Content',
    'footer-extra': null,
    'reset-button': 'Reset',
    'close-button': 'Cancel',
    'confirm-button': 'Confirm',
    onConfirm: null,
    onCancel: null,
    onReturn: null,
    onClose: null,
    onUpdateVisible: null,
});

export const getButtonModalParameters = (): Parameters => ({
    centered: { disable: true },
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=7654%3A182002',
    },
});

export const getButtonModalArgTypes = (): ArgTypes => ({
    visible: {
        name: 'visible',
        type: { name: 'boolean', required: true },
        description: 'Whether to show modal or not. sync prop.',
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
    backdrop: {
        name: 'backdrop',
        type: { name: 'boolean' },
        description: 'Whether to show backdrop or not.',
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
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Modal size. ${Object.keys(SizeMapping).map((d) => `\`${d}\``).join(', ')} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: 'select',
        options: Object.keys(SizeMapping),
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
    headerTitle: {
        name: 'headerTitle',
        type: { name: 'string' },
        description: 'Header Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Header Title',
            },
        },
        control: 'text',
    },
    hideHeader: {
        name: 'hideHeader',
        type: { name: 'boolean' },
        description: 'Whether to hide header or not.',
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
    hideBody: {
        name: 'hideBody',
        type: { name: 'boolean' },
        description: 'Whether to hide body or not.',
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
    hideFooter: {
        name: 'hideFooter',
        type: { name: 'boolean' },
        description: 'Whether to hide footer or not.',
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
    hideHeaderCloseButton: {
        name: 'hideHeaderCloseButton',
        type: { name: 'boolean' },
        description: 'Whether to hide close button in header or not.',
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
    footerResetButtonVisible: {
        name: 'footerResetButtonVisible',
        type: { name: 'boolean' },
        description: 'Whether to show reset button in footer or not.',
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
    hideFooterCloseButton: {
        name: 'hideFooterCloseButton',
        type: { name: 'boolean' },
        description: 'Whether to hide footer close button or not.',
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
    hideFooterConfirmButton: {
        name: 'hideFooterConfirmButton',
        type: { name: 'boolean' },
        description: 'Whether to hide footer confirm button or not.',
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
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Show Loading in confirm button',
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
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Disable confirm button or Not',
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
    absolute: {
        name: 'absolute',
        type: { name: 'number' },
        description: 'set position by absolute, with [{top: {absolute}rem}, {left: {absolute}rem}]',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: 'number',
    },
    modalBodyId: {
        name: 'modalBodyId',
        type: { name: 'string' },
        description: 'Applied when utilizing the id value of the body, as in the usage within the select-dropdown component',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'string',
    },
    // model
    'v-model': {
        name: 'v-model',
        type: { name: 'boolean' },
        required: false,
        description: 'Two way binding for `visible` props with `update:visible` event.',
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
        table: {
            type: {
                summary: 'Confirm',
            },
            category: 'slots',
            defaultValue: 'Confirm',
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
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onReturn: {
        name: 'return',
        description: 'Emitted when click reset button',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onClose: {
        name: 'close',
        description: 'Emitted when close modal',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateVisible: {
        name: 'update:visible',
        description: 'Emitted when update visible',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
