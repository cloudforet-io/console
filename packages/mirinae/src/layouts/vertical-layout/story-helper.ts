import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getVerticalLayoutArgs = (): Args => ({
    height: '100%',
    initWidth: 300,
    minWidth: 100,
    maxWidth: 500,
});

export const getVerticalLayoutParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A228265&t=6YbalXLy731vS0l2-4',
    },
});

export const getVerticalLayoutArgTypes = (): ArgTypes => ({
    height: {
        name: 'height',
        type: 'string',
        description: 'Height of layout.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"100%"',
            },
        },
        control: 'text',
    },
    initWidth: {
        name: 'initWidth',
        type: 'number',
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '300',
            },
        },
        control: 'number',
    },
    minWidth: {
        name: 'minWidth',
        type: 'number',
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '100',
            },
        },
        control: 'number',
    },
    maxWidth: {
        name: 'maxWidth',
        type: 'number',
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '500',
            },
        },
        control: 'number',
    },
});
