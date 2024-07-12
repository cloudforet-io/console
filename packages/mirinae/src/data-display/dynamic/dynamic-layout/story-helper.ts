import { dynamicLayoutTypes } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export const getDynamicLayoutArgTypes = () => ({
    name: {
        name: 'name',
        type: 'string',
        description: 'Name of layout',
        // defaultValue: 'Base Information',
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
    type: {
        name: 'type',
        type: 'string',
        description: 'Type of dynamic layout',
        // defaultValue: dynamicLayoutTypes[0],
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: dynamicLayoutTypes[0],
            },
        },
        control: 'select',
        options: dynamicLayoutTypes,
    },
    options: {
        name: 'options',
        type: 'object',
        description: 'Meta schema options. Different by layout type.',
        // defaultValue: mock.item.options,
        table: {
            type: {
               summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object'
    },
    data: {
        name: 'data',
        type: 'object',
        description: 'Data to display by layout.',
        // defaultValue: mock.item.data,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: 'object'
    },
    typeOptions: {
        name: 'typeOptions',
        type: 'object',
        description: 'Props for each layout component. Different by layout type.',
        // defaultValue: undefined,
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
        type: 'object',
        description: `Options for fetching data.<br/>
                      Note that it is bound when setting the initial value, but changes made later are not.`,
        // defaultValue: undefined,
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
        type: 'func',
        // defaultValue: undefined,
        description: 'Handler that executed for handling dynamic field props that bound to dynamic field component.',
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
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    totalCount: {
        name: 'totalCount',
        type: 'number',
        // defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 0,
            },
        },
        control: 'number',
        options: { min: 0 }
    },
    timezone: {
        name: 'timezone',
        type: 'string',
        // defaultValue: 'UTC',
        table: {
            type: {
                summary: 'string',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 'UTC',
            },
        },
        control: 'text',
    },
    language: {
        name: 'language',
        type: 'string',
        // defaultValue: 'en',
        table: {
            type: {
                summary: 'string',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 'en',
            },
        },
        control: 'text'
    },
    colCopy: {
        name: 'colCopy',
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    excelVisible: {
        name: 'excelVisible',
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    settingsVisible: {
        name: 'settingsVisible',
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    selectable: {
        name: 'selectable',
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    multiSelect: {
        name: 'multiSelect',
        type: 'boolean',
        // defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean'
    },
    invalid: {
        name: 'invalid',
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    selectIndex: {
        name: 'selectIndex',
        type: 'array',
        // defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object'
    },
    keyItemSets: {
        name: 'keyItemSets',
        type: 'array',
        // defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object'
    },
    valueHandlerMap: {
        name: 'valueHandlerMap',
        type: 'object',
        // defaultValue: {},
        table: {
            type: {
                summary: 'object',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object'
    },
    popupVisible: {
        name: 'popupVisible',
        type: 'boolean',
        // defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean'
    },
    // fetch options
    sortBy: {
        name: 'sortBy',
        type: 'string',
        // defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text'
    },
    sortDesc: {
        name: 'sortDesc',
        type: 'boolean',
        // defaultValue: undefined,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean'
    },
    pageStart: {
        name: 'pageStart',
        type: 'number',
        // defaultValue: undefined,
        table: {
            type: {
                summary: 'number',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: 1,
            },
        },
        control: 'number'
    },
    pageLimit: {
        name: 'pageLimit',
        type: 'number',
        // defaultValue: undefined,
        table: {
            type: {
                summary: 'number',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: 15,
            },
        },
        control: 'number'
    },
    queryTags: {
        name: 'queryTags',
        type: 'array',
        // defaultValue: getQueryTags(),
        table: {
            type: {
                summary: 'array',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object'
    },
    searchText: {
        name: 'searchText',
        type: 'string',
        // defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text'
    },
    // events
    onFetch: {
        name: 'fetch',
        description: `An event emitted by an action that needs to retrieve new data, such as a refresh or a change in the page navigation.<br/>
                    The first parameter of the handler is the entire fetch options, and as the second parameter, the fetch options with only the properties changed by the action are passed.`,
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
    onClickRow: {
        name: 'click-row',
        description: 'An event emitted when table row is clicked.',
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
    onUpdatePopupVisible: {
        name: 'update-popup-visible',
        description: 'An event emitted when popupVisible typeOptions is updated.',
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
