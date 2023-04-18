import type { ArgTypes } from '@storybook/addons';

import { STYLE_TYPE as SIDEBAR_STYLE_TYPE, SIZE as SIDEBAR_SIZE } from '@/layouts/sidebar/type';


export const getSidebarArgTypes = (): ArgTypes => ({
    visible: {
        name: 'visible',
        type: { name: 'boolean', required: true },
        description: 'Switch props for show or hide a sidebar.',
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
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'Sidebar title',
        defaultValue: 'Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'sidebar style',
        defaultValue: SIDEBAR_STYLE_TYPE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SIDEBAR_STYLE_TYPE.primary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SIDEBAR_STYLE_TYPE),
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'Sidebar size',
        defaultValue: SIDEBAR_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SIDEBAR_SIZE.md,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SIDEBAR_SIZE),
        },
    },
    isFixedSize: {
        name: 'isFixedSize',
        type: { name: 'boolean' },
        description: 'Whether or not sidebar size is fixed',
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
    hideCloseButton: {
        name: 'hideCloseButton',
        type: { name: 'boolean' },
        description: 'Show close button or not.',
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
    // slot
    titleSlot: {
        name: 'title',
        description: 'Slot for title with HTML',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    default: {
        name: 'default',
        description: 'Slot for non-sidebar contents',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    sidebar: {
        name: 'sidebar',
        description: 'Slot for contents of side bar body',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    footerSlot: {
        name: 'footer',
        description: 'Slot for bottom of the content.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    // event
    onClose: {
        name: 'close',
        description: 'Event emitted when the close button is clicked',
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
