export const getCollapsiblePanelArgTypes = () => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: 'boolean',
        description: 'Two way binding for `isCollapsed` props with `update:isCollapsed` event.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'model',
            defaultValue: {
                summary: null,
            },
        },
        control: null,
    },
    isCollapsed: {
        name: 'isCollapsed',
        type: 'boolean',
        description: 'Collapsed state of toggle button.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: 'boolean',
    },
    lineClamp: {
        name: 'lineClamp',
        type: 'number',
        description: 'It refers to the number of content lines to be displayed in the collapsed state.',
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
    /* slot */
    defaultSlot: {
        name: 'default',
        type: 'string',
        description: 'Slot for contents.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    /* event */
    onUpdateIsCollapsed: {
        name: 'update:isCollapsed',
        description: 'Event emitted when collapsed state changed. Works with `v-model` and `isCollapsed` props sync.',
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
});
