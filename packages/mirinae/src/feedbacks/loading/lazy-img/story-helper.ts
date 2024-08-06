import type { ArgTypes, Parameters, Args } from '@storybook/vue';

export const getLazyImgArgs = (): Args => ({
    height: '2rem',
    width: '2rem',
    src: '',
    errorIcon: 'ic_resource_hexagon',
    errorIconColor: '',
    loading: undefined,
    alt: undefined,
    preloaderSlot: null,
    errorSlot: null,
});

export const getLazyImgParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A133538',
    },
});

export const getLazyImgArgTypes = (): ArgTypes => ({
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'Height of image',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"2rem"',
            },
            category: 'props',
        },
        control: 'text',
    },
    width: {
        name: 'width',
        type: { name: 'string' },
        description: 'Height of image',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"2rem"',
            },
            category: 'props',
        },
        control: 'text',
    },
    src: {
        name: 'src',
        type: { name: 'string' },
        description: 'Source of image',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: 'text',
    },
    errorIcon: {
        name: 'errorIcon',
        type: { name: 'string' },
        description: 'Alternative icon name when failed to load image. Refer to Icon component.',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"ic_resource_hexagon"',
            },
            category: 'props',
        },
        control: 'text',
    },
    errorIconColor: {
        name: 'errorIconColor',
        type: { name: 'string' },
        description: 'Alternative icon\'s color.',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '""',
            },
            category: 'props',
        },
        control: 'text',
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Manual loading controller. If it\'s not given, it works automatically.',
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: 'boolean',
    },
    alt: {
        name: 'alt',
        type: { name: 'string' },
        description: 'alt attribute of image tag.',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: 'text',
    },
    /* slots */
    preloaderSlot: {
        name: 'preloader',
        description: 'Slot for image loader',
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
    // default
    error: { table: { disable: true } },
    preloader: { table: { disable: true } },
});
