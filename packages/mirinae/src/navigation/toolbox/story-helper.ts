import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { SEARCH_TYPES } from '@/navigation/toolbox/config';
import { getKeyItemSets, getQueryTags, getValueHandlerMap } from '@/navigation/toolbox/mock';


export const getToolboxArgs = (): Args => ({
    paginationVisible: true,
    pageSizeChangeable: true,
    settingsVisible: false,
    sortable: false,
    exportable: false,
    refreshable: true,
    searchable: true,
    filtersVisible: true,
    searchType: SEARCH_TYPES.plain,
    thisPage: 1,
    pageSize: 24,
    totalCount: undefined,
    hasNextPage: false,
    sortBy: '',
    pageSizeOptions: [24, 36, 48],
    sortByOptions: [],
    keyItemSets: getKeyItemSets(),
    valueHandlerMap: getValueHandlerMap(),
    queryTags: getQueryTags(),
    searchText: '',
    timezone: 'UTC',
    leftAreaSlot: undefined,
});

export const getToolboxParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A179180',
    },
});

export const getToolboxArgTypes = (): ArgTypes => ({
    paginationVisible: {
        name: 'paginationVisible',
        type: { name: 'boolean' },
        description: 'Whether to show pagination or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    pageSizeChangeable: {
        name: 'pageSizeChangeable',
        type: { name: 'boolean' },
        description: 'Whether to show page size options and allow changing page size or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    settingsVisible: {
        name: 'settingsVisible',
        type: { name: 'boolean' },
        description: 'Whether to show settings button or not.',
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
    sortable: {
        name: 'sortable',
        type: { name: 'boolean' },
        description: 'Whether to show sort menu and allow changing sort key or not.',
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
    exportable: {
        name: 'exportable',
        type: { name: 'boolean' },
        description: 'Whether to show excel button and allow export or not.',
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
    refreshable: {
        name: 'refreshable',
        type: { name: 'boolean' },
        description: 'Whether to show refresh button and allow refresh or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    searchable: {
        name: 'searchable',
        type: { name: 'boolean' },
        description: 'Whether to show search input and allow search or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    filtersVisible: {
        name: 'filtersVisible',
        type: { name: 'boolean' },
        description: 'Whether to show search filters or not. Filters exist only when search type is `query`.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    searchType: {
        name: 'searchType',
        type: { name: 'string' },
        description: `Search type. ${Object.values(SEARCH_TYPES)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SEARCH_TYPES.plain,
            },
        },
        control: 'select',
        options: Object.values(SEARCH_TYPES),
    },
    thisPage: {
        name: 'thisPage',
        type: { name: 'number' },
        description: 'Current page. sync props.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'number',
    },
    pageSize: {
        name: 'pageSize',
        type: { name: 'number' },
        description: 'Page size to show data. sync props.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'select',
        options: [24, 36, 48],
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        description: 'Total count of data for calculating pagination.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'number',
        options: { min: 0 },
    },
    hasNextPage: {
        name: 'hasNextPage',
        type: { name: 'boolean' },
        description: 'Whether to show indication that there is next page or not.  It cannot be used with totalCount prop.',
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
    sortBy: {
        name: 'sortBy',
        type: { name: 'string' },
        description: 'Sort key. sync props.',
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
    pageSizeOptions: {
        name: 'pageSizeOptions',
        type: { name: 'array' } as SBType,
        description: 'Options for dropdown of page sizes.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[24, 36, 48]',
            },
        },
        control: 'object',
    },
    sortByOptions: {
        name: 'sortByOptions',
        type: { name: 'array' } as SBType,
        description: 'Options for dropdown of sort keys.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    keyItemSets: {
        name: 'keyItemSets',
        type: { name: 'array' } as SBType,
        description: 'Query search key item sets. Follow the QuerySearch component spec.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    valueHandlerMap: {
        name: 'valueHandlerMap',
        type: { name: 'object' } as SBType,
        description: 'Query search value handler map. Follow the QuerySearch component spec.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    queryTags: {
        name: 'queryTags',
        type: { name: 'array' } as SBType,
        description: 'Query search tags. Follow the QuerySearchTags component spec. sync props.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    searchText: {
        name: 'searchText',
        type: { name: 'string' },
        description: 'Search text for plain search. Works only with plain search. sync props.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: 'text',
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone that is used for display time value of query search tags.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'UTC',
            },
        },
        control: 'text',
    },
    /* slots */
    leftAreaSlot: {
        name: 'left-area',
        description: 'Slot for left area of toolbox',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
        control: 'text',
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
    // default
    'left-area': { table: { disable: true } },
    'pagination-area': { table: { disable: true } },
    export: { table: { disable: true } },
    'click-settings': { table: { disable: true } },
    refresh: { table: { disable: true } },
});
