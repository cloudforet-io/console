import type { ArgTypes } from '@storybook/addons';

import { SEARCH_TYPES } from '@/navigation/toolbox/config';
import { getKeyItemSets, getQueryTags, getValueHandlerMap } from '@/navigation/toolbox/mock';

export const getToolboxArgTypes = (): ArgTypes => ({
    paginationVisible: {
        name: 'paginationVisible',
        type: { name: 'boolean' },
        description: 'Whether to show pagination or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    pageSizeChangeable: {
        name: 'pageSizeChangeable',
        type: { name: 'boolean' },
        description: 'Whether to show page size options and allow changing page size or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    settingsVisible: {
        name: 'settingsVisible',
        type: { name: 'boolean' },
        description: 'Whether to show settings button or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    sortable: {
        name: 'sortable',
        type: { name: 'boolean' },
        description: 'Whether to show sort menu and allow changing sort key or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    exportable: {
        name: 'exportable',
        type: { name: 'boolean' },
        description: 'Whether to show excel button and allow export or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    refreshable: {
        name: 'refreshable',
        type: { name: 'boolean' },
        description: 'Whether to show refresh button and allow refresh or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    searchable: {
        name: 'searchable',
        type: { name: 'boolean' },
        description: 'Whether to show search input and allow search or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    filtersVisible: {
        name: 'filtersVisible',
        type: { name: 'boolean' },
        description: 'Whether to show search filters or not. Filters exist only when search type is `query`.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    searchType: {
        name: 'searchType',
        type: { name: 'string' },
        description: `Search type. ${Object.values(SEARCH_TYPES)} are available.`,
        defaultValue: SEARCH_TYPES.plain,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SEARCH_TYPES.plain,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SEARCH_TYPES),
        },
    },
    thisPage: {
        name: 'thisPage',
        type: { name: 'number' },
        description: 'Current page. sync props.',
        defaultValue: 1,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    pageSize: {
        name: 'pageSize',
        type: { name: 'number' },
        description: 'Page size to show data. sync props.',
        defaultValue: 24,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'select',
            options: [24, 36, 48],
        },
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        description: 'Total count of data for calculating pagination.',
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
            options: { min: 0 },
        },
    },
    sortBy: {
        name: 'sortBy',
        type: { name: 'string' },
        description: 'Sort key. sync props.',
        defaultValue: '',
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
    pageSizeOptions: {
        name: 'pageSizeOptions',
        type: { name: 'array' },
        description: 'Options for dropdown of page sizes.',
        defaultValue: [24, 36, 48],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[24, 36, 48]',
            },
        },
        control: {
            type: 'object',
        },
    },
    sortByOptions: {
        name: 'sortByOptions',
        type: { name: 'array' },
        description: 'Options for dropdown of sort keys.',
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    keyItemSets: {
        name: 'keyItemSets',
        type: { name: 'array' },
        description: 'Query search key item sets. Follow the QuerySearch component spec.',
        defaultValue: getKeyItemSets(),
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    valueHandlerMap: {
        name: 'valueHandlerMap',
        type: { name: 'object' },
        description: 'Query search value handler map. Follow the QuerySearch component spec.',
        defaultValue: getValueHandlerMap(),
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    queryTags: {
        name: 'queryTags',
        type: { name: 'array' },
        description: 'Query search tags. Follow the QuerySearchTags component spec. sync props.',
        defaultValue: getQueryTags(),
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    searchText: {
        name: 'searchText',
        type: { name: 'string' },
        description: 'Search text for plain search. Works only with plain search. sync props.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: {
            type: 'text',
        },
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone that is used for display time value of query search tags.',
        defaultValue: 'UTC',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'UTC',
            },
        },
        control: {
            type: 'text',
        },
    },
    /* slots */
    leftAreaSlot: {
        name: 'left-area',
        description: 'Slot for left area of toolbox',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
        control: {
            type: 'text',
        },
    },
    /* events */
    onChange: {
        name: 'change',
        description: `Event emitted when pagination or sort value is changed.
         First argument is 'options'.`,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onExport: {
        name: 'export',
        description: 'Event emitted when export button clicked',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onRefresh: {
        name: 'refresh',
        description: 'Event emitted when refresh button clicked',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onClickSettings: {
        name: 'click-settings',
        description: 'Event emitted when settings button clicked',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
});
