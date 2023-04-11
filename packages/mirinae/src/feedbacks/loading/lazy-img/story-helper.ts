import type { ArgTypes } from '@storybook/addons';

export const getLazyImgArgTypes = (): ArgTypes => ({
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'Height of image',
        defaultValue: '2rem',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"2rem"',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    width: {
        name: 'width',
        type: { name: 'string' },
        description: 'Height of image',
        defaultValue: '2rem',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"2rem"',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    src: {
        name: 'src',
        type: { name: 'string' },
        description: 'Source of image',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    errorIcon: {
        name: 'errorIcon',
        type: { name: 'string' },
        description: 'Alternative icon name when failed to load image. Refer to Icon component.',
        defaultValue: 'ic_resource_hexagon',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"ic_resource_hexagon"',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    errorIconColor: {
        name: 'errorIconColor',
        type: { name: 'string' },
        description: 'Alternative icon\'s color.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '""',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Manual loading controller. If it\'s not given, it works automatically.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: {
            type: 'boolean',
        },
    },
    alt: {
        name: 'alt',
        type: { name: 'string' },
        description: 'alt attribute of image tag.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    /* slots */
    preloaderSlot: {
        name: 'preloader',
        description: 'Slot for image loader',
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
        control: null,
    },
    errorSlot: {
        name: 'error',
        description: 'Slot for error icon',
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
        control: null,
    },
});
