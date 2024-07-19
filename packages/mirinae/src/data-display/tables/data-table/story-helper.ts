import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { DATA_TABLE_STYLE_TYPE } from '@/data-display/tables/data-table/config';
import { getUserFields, getUsers } from '@/data-display/tables/data-table/mock';

export const getDataTableParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getDataTableArgs = (): Args => ({
    loading: false,
    fields: getUserFields(),
    items: getUsers(),
    sortable: false,
    sortBy: '',
    sortDesc: true,
    colCopy: false,
    selectable: false,
    selectIndex: [],
    multiSelect: false,
    rowClickMultiSelectMode: false,
    useCursorLoading: false,
    tableStyleType: DATA_TABLE_STYLE_TYPE.default,
    tableCustomStyle: {},
    striped: false,
    bordered: true,
    disableHover: false,
    rowHeightFixed: true,
    rowCursorPointer: false,
    invalid: false,
    getRowClassNames: undefined,
    getRowSelectable: undefined,
    beautifyText: false,
    headSlot: null,
    theadSlot: null,
    theadFormatSlot: null,
    noDataSlot: null,
    noDataFormatSlot: null,
    bodySlot: null,
    colFormatNamedSlot: null,
    colFormatIndexSlot: null,
    loadingSlot: null,
});

export const getDataTableArgsType = (): ArgTypes => ({
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether to show loading spinner or not.',
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
    fields: {
        name: 'fields',
        type: { name: 'array', required: true } as SBType,
        description: 'Table columns. Array of field type object or string.',
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
    items: {
        name: 'items',
        type: { name: 'array' } as SBType,
        description: 'Table data array.',
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
    sortable: {
        name: 'sortable',
        type: { name: 'boolean' },
        description: 'Whether to make table sortable or not.',
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
    sortBy: {
        name: 'sortBy',
        type: { name: 'string' },
        description: 'Sort key. Must be one of `fields` item\'s name. Works with `sync`.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    sortDesc: {
        name: 'sortDesc',
        type: { name: 'boolean' },
        description: 'Whether to make sort table data by sort key(`sortBy` props) in descending or ascending order. Works with `sync`.',
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
    colCopy: {
        name: 'colCopy',
        type: { name: 'boolean' },
        description: 'Whether to show copy button to columns or not.',
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
    selectable: {
        name: 'selectable',
        type: { name: 'boolean' },
        description: 'Whether to make table rows selectable or not.',
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
    selectIndex: {
        name: 'selectIndex',
        type: { name: 'array' } as SBType,
        description: 'Selected table row\'s index or array of indices. Works with `sync`.',
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
    multiSelect: {
        name: 'multiSelect',
        type: { name: 'boolean' },
        description: 'Whether to allow table row multi selection or not.',
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
    rowClickMultiSelectMode: {
        name: 'rowClickMultiSelectMode',
        type: { name: 'boolean' },
        description: 'Whether to allow table row click as multi selection or not.',
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
    useCursorLoading: {
        name: 'useCursorLoading',
        type: { name: 'boolean' },
        description: 'Whether to show cursor loading or not when `loading` props is `true`.',
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
    tableStyleType: {
        name: 'tableStyleType',
        type: { name: 'string' },
        description: `Style type for table. ${Object.values(DATA_TABLE_STYLE_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DATA_TABLE_STYLE_TYPE.default,
            },
        },
        control: 'select',
        options: Object.values(DATA_TABLE_STYLE_TYPE),
    },
    tableCustomStyle: {
        name: 'tableCustomStyle',
        type: { name: 'object' } as SBType,
        description: "Custom inline style for table. HTML element's style properties are available.",
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
    striped: {
        name: 'striped',
        type: { name: 'boolean' },
        description: 'Whether to separate rows by striped background color or not.',
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
    bordered: {
        name: 'bordered',
        type: { name: 'boolean' },
        description: 'Whether to display table rows border or not.',
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
    disableHover: {
        name: 'disableHover',
        type: { name: 'boolean' },
        description: 'Whether to show table rows hover style or not.',
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
    rowHeightFixed: {
        name: 'rowHeightFixed',
        type: { name: 'boolean' },
        description: 'Whether to make table cell height fixed or not.',
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
    rowCursorPointer: {
        name: 'rowCursorPointer',
        type: { name: 'boolean' },
        description: 'Whether to apply cursor pointer style to rows or not.',
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
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to apply invalid style to table or not.',
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
    getRowClassNames: {
        name: 'getRowClassNames',
        type: { name: 'function' },
        description: 'The function that receives row data and index as arguments, and returns class names for each row as an object.',
        table: {
            type: {
                summary: 'function',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
    },
    getRowSelectable: {
        name: 'getRowSelectable',
        type: { name: 'function' },
        description: 'The function that receives row data and index as arguments, and returns a `boolean` indicating whether the row is selectable or not.',
        table: {
            type: {
                summary: 'function',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
    },
    beautifyText: {
        name: 'beautifyText',
        type: { name: 'boolean' },
        description: 'Whether to beautify text or not. See the `TextBeautifier` component.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
    },
    /* slots */
    headSlot: {
        name: 'head',
        description: 'Slot for inner HTML of thead.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    theadSlot: {
        name: 'th-<field.name>',
        description: 'Slot for thead of specific field name.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    theadFormatSlot: {
        name: 'th-<field.name>-format',
        description: 'Slot for thead of specific field name with default style.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    noDataSlot: {
        name: 'no-data',
        description: 'Slot for replacing no data display.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    noDataFormatSlot: {
        name: 'no-data-format',
        description: 'Slot for replacing no data display with default style.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    bodySlot: {
        name: 'body',
        description: 'Slot for replacing table body.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    colFormatNamedSlot: {
        name: 'col-<field.name>-format',
        description: 'Slot for data cells of specific field name with default style.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    colFormatIndexSlot: {
        name: 'col-<field index>-format',
        description: 'Slot for data cells of specific field index with default style.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    loadingSlot: {
        name: 'loading',
        description: 'Slot for replacing loading display.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    /* events */
    onSelect: {
        name: 'select',
        description: 'Emitted when the row is selected.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onRowLeftClick: {
        name: 'rowLeftClick',
        description: 'Emitted when the left mouse clicked on the rows.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onChangeSort: {
        name: 'changeSort',
        description: 'Emitted when the `sortBy` or `sortDesc` are changed.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateSelectIndex: {
        name: 'update:selectIndex',
        description: 'Emitted when the `selectIndex` is updated.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateSortBy: {
        name: 'update:sortBy',
        description: 'Emitted when the `sortBy` is updated.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateSortDesc: {
        name: 'update:sortDesc',
        description: 'Emitted when the `sortDesc` is updated.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    head: { table: { disable: true } },
    'th-format': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`th-${field.name}`': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`th-${field.name}-format`': { table: { disable: true } },
    'no-data': { table: { disable: true } },
    'no-data-format': { table: { disable: true } },
    body: { table: { disable: true } },
    'col-format': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`col-${field.name}-format`': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`col-${colIndex}-format`': { table: { disable: true } },
    foot: { table: { disable: true } },
});
