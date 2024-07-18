import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { STYLE_TYPE as SIDEBAR_STYLE_TYPE, SIZE as SIDEBAR_SIZE } from '@/layouts/sidebar/type';


export const getSidebarArgs = (): Args => ({
    visible: false,
    title: 'Title',
    styleType: SIDEBAR_STYLE_TYPE.primary,
    size: SIDEBAR_SIZE.md,
    isFixedSize: false,
    hideCloseButton: false,
    'v-model': false,
    titleSlot: null,
    default: null,
    sidebar: null,
    footerSlot: null,
});

export const getSidebarParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6980%3A163443',
    },
});

export const getSidebarArgTypes = (): ArgTypes => ({
    visible: {
        name: 'visible',
        type: 'boolean',
        required: true,
        description: 'Switch props for show or hide a sidebar.',
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
    title: {
        name: 'title',
        type: 'string',
        description: 'Sidebar title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    styleType: {
        name: 'styleType',
        type: 'string',
        description: 'sidebar style',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SIDEBAR_STYLE_TYPE.primary,
            },
        },
        control: 'select',
        options: Object.values(SIDEBAR_STYLE_TYPE),
    },
    size: {
        name: 'size',
        type: 'string',
        description: 'Sidebar size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SIDEBAR_SIZE.md,
            },
        },
        control: 'select',
        options: Object.values(SIDEBAR_SIZE),
    },
    isFixedSize: {
        name: 'isFixedSize',
        type: 'boolean',
        description: 'Whether or not sidebar size is fixed',
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
    hideCloseButton: {
        name: 'hideCloseButton',
        type: 'boolean',
        description: 'Show close button or not.',
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
    'v-model': {
        name: 'v-model',
        type: 'boolean',
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
    // slot
    titleSlot: {
        name: 'title',
        description: 'Slot for title with HTML',
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
