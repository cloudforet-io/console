import type { ArgTypes } from '@storybook/addons';

export const getPageTitleArgTypes = (): ArgTypes => ({
    title: {
        name: 'title',
        type: { name: 'string' },
        description: 'The value to display.',
        defaultValue: 'Page Title',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    child: {
        name: 'child',
        type: { name: 'boolean' },
        description: 'Whether to display back button or not.',
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
    useTotalCount: {
        name: 'useTotalCount',
        type: { name: 'boolean' },
        description: 'Whether to show total count or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        description: 'Number to display next to title. Works only when `useTotalCount` prop is `true`.',
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: {
            type: 'number',
        },
    },
    useSelectedCount: {
        name: 'useSelectedCount',
        type: { name: 'boolean' },
        description: 'Whether to show selected count with total count or not.',
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
            type: 'numbooleanber',
        },
    },
    selectedCount: {
        name: 'selectedCount',
        type: { name: 'number' },
        description: 'Number to display next to title with total count. Works only when `useTotalCount` and `useSelectedCount` props are `true`.',
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: {
            type: 'number',
        },
    },
    titleOverflow: {
        name: 'titleOverflow',
        type: { name: 'string' },
        description: 'The value for title overflow style property.',
        defaultValue: 'hidden',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"hidden"',
            },
        },
        control: {
            type: 'text',
        },
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for the title.',
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
