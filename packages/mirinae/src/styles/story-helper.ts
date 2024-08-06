import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getColorsArgs = (): Args => ({
    color: null,
});

export const getColorsParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2137%3A5668',
    },
});

export const getColorsArgTypes = (): ArgTypes => ({
    color: {
        name: 'colors',
        description: 'Colors for SpaceONE Design System',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
        },
    },
});
