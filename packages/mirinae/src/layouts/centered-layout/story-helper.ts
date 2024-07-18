import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getCenteredLayoutArgs = (): Args => ({
    defaultSlot: 'This is contents',
    topContentsSlot: null,
});

export const getCenteredLayoutParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A228226&t=GVsFwo5txLv6VtoA-4',
    },
});

export const getCenteredLayoutArgTypes = (): ArgTypes => ({
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for layout contents.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    topContentsSlot: {
        name: 'top-contents',
        description: 'Slot for top contents.',
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
    'top-contents': { table: { disable: true } },
    default: { table: { disable: true } },
});
