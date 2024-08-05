import type { ArgTypes, Args } from '@storybook/vue';

export const getSkeletonArgs = (): Args => ({
    loading: true,
    animation: true,
    duration: 2,
    width: null,
    height: null,
    tag: 'span',
    opacity: 0.4,
});

export const getSkeletonArgTypes = (): ArgTypes => ({
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Loading when true',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    animation: {
        name: 'animation',
        type: { name: 'boolean' },
        description: 'Animate when true',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    duration: {
        name: 'duration',
        type: { name: 'number' },
        description: 'Duration of animation',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 2,
            },
        },
        control: 'number',
    },
    width: {
        name: 'width',
        type: { name: 'string' },
        description: 'Width of skeleton',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'text',
    },
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'Width of skeleton',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'text',
    },
    tag: {
        name: 'tag',
        type: { name: 'string' },
        description: 'Tag of skeleton',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'span',
            },
        },
        control: 'text',
    },
    opacity: {
        name: 'opacity',
        type: { name: 'number' },
        description: 'Opacity of skeleton',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0.4,
            },
        },
        control: 'number',
    },
});
