import type { ArgTypes } from '@storybook/addons';

import { EmptyImageSize } from '@/data-display/empty/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getEmptyArgTypes = (): ArgTypes => ({
    showImage: {
        name: 'showImage',
        type: { name: 'boolean' },
        description: 'Disabled when true',
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
    imageSize: {
        name: 'imageSize',
        type: { name: 'string' },
        description: `Image size. ${Object.keys(EmptyImageSize).map((d) => `\`${d}\``).join(', ')} are available.`,
        defaultValue: EmptyImageSize.sm,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: EmptyImageSize.sm,
            },
        },
        control: {
            type: 'select',
            options: Object.values(EmptyImageSize),
        },
    },
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'Empty title',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: {
            type: 'text',
        },
    },
    showButton: {
        name: 'showButton',
        type: { name: 'boolean' },
        description: 'Disabled when true',
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
    buttonStyleType: {
        name: 'buttonStyleType',
        type: { name: 'string' },
        description: 'Button style',
        defaultValue: BUTTON_STYLE.substitutive,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BUTTON_STYLE),
        },
    },
    buttonTitle: {
        name: 'buttonTitle',
        type: { name: 'string' },
        description: 'Button title',
        defaultValue: 'Button',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: {
            type: 'text',
        },
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents of empty',
        defaultValue: 'No Data',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    imageSlot: {
        name: 'image',
        description: 'Slot for image of empty.',
        defaultValue: undefined,
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
        defaultValue: undefined,
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
