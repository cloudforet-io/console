import icon from 'vue-svgicon';

export const getBoardItemArgTypes = () => ({
    leftIcon: {
        name: 'leftIcon',
        type: 'string',
        description: 'Icon name in Left Content Area.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_refresh',
            },
        },
        control: 'select',
        options: Object.keys(icon.icons),
    },
    iconButtonSets: {
        name: 'iconButtonSets',
        type: 'array',
        description: 'Array of icon-button-set that will fit into the right overlay content area',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
    },
    rounded: {
        name: 'rounded',
        type: 'boolean',
        description: 'Use `border-radius` style of the card item.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    selected: {
        name: 'selected',
        type: 'boolean',
        description: 'Selected style',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    // slots
    contentSlot: {
        name: 'content',
        description: 'Slot for main contents',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Main Content',
        },
    },
    leftContentSlot: {
        name: 'leftContent',
        description: 'Slot to replace left icon',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Left Content',
        },
    },
    customRightContentSlot: {
        name: 'customRightContentSlot',
        description: 'Slot to replace right-icon-button-content to custom content',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Custom Right Content',
        },
    },
});
