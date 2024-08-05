import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getOverlayLayoutArgs = (): Args => ({
    visible: false,
    title: 'Title',
    styleType: 'primary',
    size: 'md',
    isFixedSize: false,
    hideHeader: false,
    defaultSlot: 'This is contents',
    titleRightExtraSlot: 'This is title right extra',
    footerSlot: 'This is footer',
});

export const getOverlayLayoutParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?type=design&node-id=12713-476645&mode=design&t=BTZznWYzU2ZBSJ59-0',
    },
});

export const getOverlayLayoutArgTypes = (): ArgTypes => ({
    // props
    visible: {
        name: 'visible',
        description: 'Whether the overlay is visible or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: false,
            },
            category: 'props',
        },
        control: 'boolean',
    },
    title: {
        name: 'title',
        description: 'Title of the overlay.',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'Title',
            },
            category: 'props',
        },
        control: 'text',
    },
    styleType: {
        name: 'styleType',
        description: 'Style type of the overlay.',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'primary',
            },
            category: 'props',
        },
        control: 'select',
        options: ['primary', 'secondary'],
    },
    size: {
        name: 'size',
        description: 'Size of the overlay.',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'md',
            },
            category: 'props',
        },
        control: 'select',
        options: ['md', 'lg'],
    },
    isFixedSize: {
        name: 'isFixedSize',
        description: 'Whether the overlay is fixed size or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: false,
            },
            category: 'props',
        },
        control: 'boolean',
    },
    hideHeader: {
        name: 'hideHeader',
        description: 'Whether to hide the header or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: false,
            },
            category: 'props',
        },
        control: 'boolean',
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for layout contents.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    titleRightExtraSlot: {
        name: 'title-right-extra',
        description: 'Slot for extra contents on the right side of the title.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    footerSlot: {
        name: 'footer',
        description: 'Slot for footer contents.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    // event
    close: {
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
    // default
    'title-right-extra': { table: { disable: true } },
    default: { table: { disable: true } },
    footer: { table: { disable: true } },
    'update:visible': { table: { disable: true } },
});
