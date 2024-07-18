import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getHorizontalLayoutArgs = (): Args => ({
    height: 400,
    minHeight: 300,
    maxHeight: 1000,
    container: null,
    onResizeEnd: null,
});

export const getHorizontalLayoutParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A228226&t=GVsFwo5txLv6VtoA-4',
    },
});

export const getHorizontalLayoutArgTypes = (): ArgTypes => ({
    height: {
        name: 'height',
        type: 'number',
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '"400"',
            },
        },
        control: 'number',
    },
    minHeight: {
        name: 'minHeight',
        type: 'number',
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '"300"',
            },
        },
        control: 'number',
    },
    maxHeight: {
        name: 'maxHeight',
        type: 'number',
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '"1000"',
            },
        },
        control: 'number',
    },

    // slots
    container: {
        name: 'container',
        description: 'Slot for layout contents.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },

    // events
    onResizeEnd: {
        name: 'resize-end',
        description: 'Emitted when resizing is end.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
