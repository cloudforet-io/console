import type { ArgTypes } from '@storybook/addons';

export const getOverlayLayoutArgTypes = (): ArgTypes => ({
    // props
    visible: {
        name: 'visible',
        description: 'Whether the overlay is visible or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: false,
            },
            category: 'props',
        },
        control: {
            type: 'boolean',
        },
    },
    title: {
        name: 'title',
        description: 'Title of the overlay.',
        defaultValue: 'Title',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'Title',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    styleType: {
        name: 'styleType',
        description: 'Style type of the overlay.',
        defaultValue: 'primary',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'primary',
            },
            category: 'props',
        },
        control: {
            type: 'select',
            options: ['primary', 'secondary'],
        },
    },
    size: {
        name: 'size',
        description: 'Size of the overlay.',
        defaultValue: 'md',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'md',
            },
            category: 'props',
        },
        control: {
            type: 'select',
            options: ['md', 'lg'],
        },
    },
    isFixedSize: {
        name: 'isFixedSize',
        description: 'Whether the overlay is fixed size or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: false,
            },
            category: 'props',
        },
        control: {
            type: 'boolean',
        },
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for layout contents.',
        defaultValue: 'This is contents',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    titleRightExtraSlot: {
        name: 'title-right-extra',
        description: 'Slot for extra contents on the right side of the title.',
        defaultValue: 'This is title right extra',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    footerSlot: {
        name: 'footer',
        description: 'Slot for footer contents.',
        defaultValue: 'This is footer',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
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
});
