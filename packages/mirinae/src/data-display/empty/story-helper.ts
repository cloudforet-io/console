import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { EmptyImageSize } from '@/data-display/empty/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getEmptyArgs = (): Args => ({
    showImage: false,
    imageSize: EmptyImageSize.sm,
    title: undefined,
    showButton: false,
    buttonStyleType: BUTTON_STYLE.substitutive,
    buttonTitle: 'Button',
    defaultSlot: 'No Data',
});

export const getEmptyParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A179434',
    },
});

export const getEmptyArgTypes = (): ArgTypes => ({
    showImage: {
        name: 'showImage',
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    // default
    image: { table: { disable: true } },
    default: { table: { disable: true } },
    button: { table: { disable: true } },
    'click-button': { table: { disable: true } },
});
