import { EmptyImageSize } from '@/data-display/empty/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getEmptyArgTypes = () => ({
    showImage: {
        name: 'showImage',
        type: 'boolean',
        description: 'Disabled when true',
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
    imageSize: {
        name: 'imageSize',
        type: 'string',
        description: `Image size. ${Object.keys(EmptyImageSize).map((d) => `\`${d}\``).join(', ')} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: EmptyImageSize.sm,
            },
        },
        control: 'select',
        options: Object.values(EmptyImageSize),
    },
    title: {
        name: 'title',
        type: 'string',
        description: 'Empty title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'text',
    },
    showButton: {
        name: 'showButton',
        type: 'boolean',
        description: 'Disabled when true',
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
    buttonStyleType: {
        name: 'buttonStyleType',
        type: 'string',
        description: 'Button style',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'select',
        options: Object.values(BUTTON_STYLE),
    },
    buttonTitle: {
        name: 'buttonTitle',
        type: 'string',
        description: 'Button title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'text',
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        type: 'string',
        description: 'Slot for contents of empty',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    imageSlot: {
        name: 'image',
        description: 'Slot for image of empty.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    buttonSlot: {
        name: 'button',
        description: 'Slot for button of empty.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },

    // event
    clickButton: {
        name: 'click-button',
        description: 'Event emitted when the button is clicked',
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
