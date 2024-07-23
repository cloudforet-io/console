import type { SBType } from '@storybook/types';
import type { ArgTypes, Args } from '@storybook/vue';

import mock, { getQueryTags } from '@/data-display/dynamic/dynamic-layout/mock';
import { dynamicLayoutTypes } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

export const getDynamicLayoutArgs = (): Args => ({
    name: 'Base Information',
    options: mock.item.options,
    data: mock.item.data,
    loading: false,
    totalCount: 0,
    timezone: 'UTC',
    selectIndex: [],
    selectable: false,
    multiSelect: true,
    invalid: false,
    colCopy: false,
    excelVisible: false,
    settingsVisible: false,
    sortBy: undefined,
    sortDesc: undefined,
    pageStart: undefined,
    pageLimit: undefined,
    searchText: '',
    valueHandlerMap: {},
    keyItemSets: [],
    language: 'en',
    popupVisible: false,
    queryTags: getQueryTags(),
});

export const getDynamicLayoutArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'Name of layout',
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
        type: { name: 'string' },
        description: 'Type of dynamic layout',
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
        type: { name: 'object' } as SBType,
        description: 'Meta schema options. Different by layout type.',
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
    data: {
        name: 'data',
        type: { name: 'object' } as SBType,
        description: 'Data to display by layout.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: 'object',
    },
    typeOptions: {
        name: 'typeOptions',
        type: { name: 'object' } as SBType,
        description: 'Props for each layout component. Different by layout type.',
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
        type: { name: 'object' } as SBType,
        description: `Options for fetching data.<br/>
                      Note that it is bound when setting the initial value, but changes made later are not.`,
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
        type: { name: 'function' },
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
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    totalCount: {
        name: 'totalCount',
        type: { name: 'number' },
        table: {
            type: {
                summary: 'number',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 0,
            },
        },
        control: { type: 'number', min: 0 },
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
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
        type: { name: 'string' },
        table: {
            type: {
                summary: 'string',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: 'en',
            },
        },
        control: 'text',
    },
    colCopy: {
        name: 'colCopy',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    excelVisible: {
        name: 'excelVisible',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    settingsVisible: {
        name: 'settingsVisible',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    selectable: {
        name: 'selectable',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    multiSelect: {
        name: 'multiSelect',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    selectIndex: {
        name: 'selectIndex',
        type: { name: 'array' } as SBType,
        table: {
            type: {
                summary: 'array',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    keyItemSets: {
        name: 'keyItemSets',
        type: { name: 'array' } as SBType,
        table: {
            type: {
                summary: 'array',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    valueHandlerMap: {
        name: 'valueHandlerMap',
        type: { name: 'object' } as SBType,
        table: {
            type: {
                summary: 'object',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    popupVisible: {
        name: 'popupVisible',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'typeOptions',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    // fetch options
    sortBy: {
        name: 'sortBy',
        type: { name: 'string' },
        table: {
            type: {
                summary: 'string',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    sortDesc: {
        name: 'sortDesc',
        type: { name: 'boolean' },
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    pageStart: {
        name: 'pageStart',
        type: { name: 'number' },
        table: {
            type: {
                summary: 'number',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: 1,
            },
        },
        control: 'number',
    },
    pageLimit: {
        name: 'pageLimit',
        type: { name: 'number' },
        table: {
            type: {
                summary: 'number',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: 15,
            },
        },
        control: 'number',
    },
    queryTags: {
        name: 'queryTags',
        type: { name: 'array' } as SBType,
        table: {
            type: {
                summary: 'array',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    searchText: {
        name: 'searchText',
        type: { name: 'string' },
        table: {
            type: {
                summary: 'string',
            },
            category: 'fetchOptions',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
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
    // default
    slot: { table: { disable: true } },
});
