import { HEADING_TYPE } from '@/data-display/heading/config';

export const getHeadingArgTypes = () => ({
    title: {
        name: 'title',
        type: 'string',
        description: 'The value to display.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    headingType: {
        name: 'headingType',
        type: 'string',
        description: 'Type of heading.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${HEADING_TYPE.MAIN}"`,
            },
        },
        control: 'select',
        options: Object.values(HEADING_TYPE),
    },
    showBackButton: {
        name: 'showBackButton',
        type: 'boolean',
        description: 'Whether to display back button or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    useTotalCount: {
        name: 'useTotalCount',
        type: 'boolean',
        description: 'Whether to show total count or not.',
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
    totalCount: {
        name: 'totalCount',
        type: 'number',
        description: 'Number to display next to title. Works only when `useTotalCount` prop is `true`.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: 'number',
    },
    useSelectedCount: {
        name: 'useSelectedCount',
        type: 'boolean',
        description: 'Whether to show selected count with total count or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'numbooleanber',
    },
    selectedCount: {
        name: 'selectedCount',
        type: 'number',
        description: 'Number to display next to title with total count. Works only when `useTotalCount` and `useSelectedCount` props are `true`.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: 'number',
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for the title.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    titleSlot: {
        name: 'title',
        description: 'Slot for the title. (will be deprecated)',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    titleLeftExtraSlot: {
        name: 'title-left-extra',
        description: 'The slot the left of the title.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    totalCountSlot: {
        name: 'total-count',
        description: 'The slot for total count.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    titleRightExtraSlot: {
        name: 'title-right-extra',
        description: 'The slot displayed right next to the title.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    extraSlot: {
        name: 'extra',
        description: 'The slot on the right edge of the title block.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    // events
    onGoBack: {
        name: 'goBack',
        description: 'Emitted when back button is clicked.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
