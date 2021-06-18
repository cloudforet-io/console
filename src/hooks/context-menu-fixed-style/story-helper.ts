export const getContextMenuFixedStyleArgTypes = () => ({
    useFixedMenuStyle: {
        name: 'useFixedMenuStyle',
        type: { name: 'boolean' },
        description: 'Whether to use position fixed style on menu or not. ',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    visibleMenu: {
        name: 'visibleMenu',
        type: { name: 'boolean' },
        description: 'Whether to show the menu or not. Automatically determined if no value is given. `sync` props.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: null,
        },
    },
    /* events */
    onUpdateVisibleMenu: {
        name: 'update:visibleMenu',
        description: 'Event emitted when `visibleMenu` props updated for `sync`.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    }
});
