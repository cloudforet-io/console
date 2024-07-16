export const getSkeletonDefaultArgs = () => ({
    loading: true,
    animation: true,
    duration: 2,
    width: undefined,
    height: undefined,
    tag: 'span',
    opacity: 0.4,
});

export const getSkeletonArgTypes = () => ({
    loading: {
        name: 'loading',
        type: 'boolean',
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
        type: 'boolean',
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
        type: 'number',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'number',
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
