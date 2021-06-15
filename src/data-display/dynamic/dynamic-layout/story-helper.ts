import mock from '@/data-display/dynamic/dynamic-layout/mock';

export const argTypes = {
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'Name of layout',
        defaultValue: 'Base Information',
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
    type: {
        name: 'type',
        type: { name: 'string' },
        description: 'Type of dynamic layout',
        defaultValue: 'item',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'item',
            },
        },
        control: {
            type: 'select',
            options: ['item', 'html', 'markdown', 'query-search-table', 'raw-table', 'table', 'simple-table', 'raw'],
        },
    },
    options: {
        name: 'options',
        type: { name: 'object' },
        description: 'Meta schema options. Different by layout type.',
        defaultValue: mock.item.options,
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
    data: {
        name: 'data',
        type: { name: 'object' },
        description: 'Data to display by layout.',
        defaultValue: mock.item.data,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: {
            type: 'object',
        },
    },
    typeOptions: {
        name: 'typeOptions',
        type: { name: 'object' },
        description: 'Props for each layout component. Different by layout type.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: null,
    },
    fetchOptions: {
        name: 'fetchOptions',
        type: { name: 'object' },
        description: `Options for fetching data.<br/>
                      Note that it is bound when setting the initial value, but changes made later are not.`,
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: null,
    },
    fieldHandler: {
        name: 'fieldHandler',
        type: { name: 'func' },
        description: 'Handler that executed for handling dynamic field props that bound to dynamic field component.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'func',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: null,
    },
    // type options
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
            options: { min: 0 },
        },
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        defaultValue: 'UTC',
        table: {
            type: {
                summary: 'string',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 'UTC',
            },
        },
        control: {
            type: 'text',
        },
    },
    language: {
        name: 'language',
        type: { name: 'string' },
        defaultValue: 'en',
        table: {
            type: {
                summary: 'string',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 'en',
            },
        },
        control: {
            type: 'text',
        },
    },
    colCopy: {
        name: 'colCopy',
        type: { name: 'boolean' },
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    excelVisible: {
        name: 'excelVisible',
        type: { name: 'boolean' },
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    settingsVisible: {
        name: 'settingsVisible',
        type: { name: 'boolean' },
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    searchable: {
        name: 'searchable',
        type: { name: 'boolean' },
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    selectable: {
        name: 'selectable',
        type: { name: 'boolean' },
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    multiSelect: {
        name: 'multiSelect',
        type: { name: 'boolean' },
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    selectIndex: {
        name: 'selectIndex',
        type: { name: 'array' },
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'typeOptions',
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
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'typeOptions',
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
        defaultValue: {},
        table: {
            type: {
                summary: 'object',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    // fetch options
    sortBy: {
        name: 'sortBy',
        type: { name: 'string' },
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    sortDesc: {
        name: 'sortDesc',
        type: { name: 'boolean' },
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    pageStart: {
        name: 'pageStart',
        type: { name: 'number' },
        defaultValue: 1,
        table: {
            type: {
                summary: 'number',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: 1,
            },
        },
        control: {
            type: 'number',
        },
    },
    pageLimit: {
        name: 'pageLimit',
        type: { name: 'number' },
        defaultValue: 15,
        table: {
            type: {
                summary: 'number',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: 15,
            },
        },
        control: {
            type: 'number',
        },
    },
    queryTags: {
        name: 'queryTags',
        type: { name: 'array' },
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'fetchOptions',
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
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    // events
    onInit: {
        name: 'init',
        description: `Event emitted just before dynamic layout created.<br/>
                    The first parameter of the handler is the entire fetch options.`,
        defaultValue: null,
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
    onFetch: {
        name: 'fetch',
        description: `An event emitted by an action that needs to retrieve new data, such as a refresh or a change in the page navigation.<br/>
                    The first parameter of the handler is the entire fetch options, and as the second parameter, the fetch options with only the properties changed by the action are passed.`,
        defaultValue: null,
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
    onSelect: {
        name: 'select',
        description: 'An event emitted by an select action.',
        defaultValue: null,
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
        description: 'An event emitted by an export action.',
        defaultValue: null,
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
        description: 'An event emitted by an settings button click action.',
        defaultValue: null,
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
};
