import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getHeadingLayoutParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6980%3A163403',
    },
});

export const getHeadingLayoutArgs = (): Args => ({
    heading: null,
    extra: null,
});

export const getHeadingLayoutArgTypes = (): ArgTypes => ({
    // slots
    heading: {
        name: 'heading',
        description: 'The slot on the left edge of the layout block which is used to display the heading.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    extra: {
        name: 'extra',
        description: 'The slot on the right edge of the layout block.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
});
