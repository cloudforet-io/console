import type { ArgTypes } from '@storybook/addons';

import { DATA_TABLE_STYLE_TYPE } from '@/data-display/tables/data-table/config';
import { getUserFields, getUsers } from '@/data-display/tables/data-table/mock';

export const getDataTableArgsType = (): ArgTypes => ({
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether to show loading spinner or not.',
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
    fields: {
        name: 'fields',
        type: { name: 'array', required: true },
        description: 'Table columns. Array of field type object or string.',
        defaultValue: getUserFields(),
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
    items: {
        name: 'items',
        type: { name: 'array' },
        description: 'Table data array.',
        defaultValue: getUsers(),
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
    sortable: {
        name: 'sortable',
        type: { name: 'boolean' },
        description: 'Whether to make table sortable or not.',
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
    sortBy: {
        name: 'sortBy',
        type: { name: 'string' },
        description: 'Sort key. Must be one of `fields` item\'s name. Works with `sync`.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    sortDesc: {
        name: 'sortDesc',
        type: { name: 'boolean' },
        description: 'Whether to make sort table data by sort key(`sortBy` props) in descending or ascending order. Works with `sync`.',
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
    colCopy: {
        name: 'colCopy',
        type: { name: 'boolean' },
        description: 'Whether to show copy button to columns or not.',
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
    selectable: {
        name: 'selectable',
        type: { name: 'boolean' },
        description: 'Whether to make table rows selectable or not.',
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
    selectIndex: {
        name: 'selectIndex',
        type: { name: 'array' },
        description: 'Selected table row\'s index or array of indices. Works with `sync`.',
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
    multiSelect: {
        name: 'multiSelect',
        type: { name: 'boolean' },
        description: 'Whether to allow table row multi selection or not.',
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
    rowClickMultiSelectMode: {
        name: 'rowClickMultiSelectMode',
        type: { name: 'boolean' },
        description: 'Whether to allow table row click as multi selection or not.',
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
    useCursorLoading: {
        name: 'useCursorLoading',
        type: { name: 'boolean' },
        description: 'Whether to show cursor loading or not when `loading` props is `true`.',
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
    tableStyleType: {
        name: 'tableStyleType',
        type: { name: 'string' },
        description: `Style type for table. ${Object.values(DATA_TABLE_STYLE_TYPE)} are available.`,
        defaultValue: DATA_TABLE_STYLE_TYPE.default,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DATA_TABLE_STYLE_TYPE.default,
            },
        },
        control: {
            type: 'select',
            options: Object.values(DATA_TABLE_STYLE_TYPE),
        },
    },
    tableCustomStyle: {
        name: 'tableCustomStyle',
        type: { name: 'object' },
        description: "Custom inline style for table. HTML element's style properties are available.",
        defaultValue: {},
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
    striped: {
        name: 'striped',
        type: { name: 'boolean' },
        description: 'Whether to separate rows by striped background color or not.',
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
    bordered: {
        name: 'bordered',
        type: { name: 'boolean' },
        description: 'Whether to display table rows border or not.',
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
    disableHover: {
        name: 'disableHover',
        type: { name: 'boolean' },
        description: 'Whether to show table rows hover style or not.',
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
    rowHeightFixed: {
        name: 'rowHeightFixed',
        type: { name: 'boolean' },
        description: 'Whether to make table cell height fixed or not.',
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
    rowCursorPointer: {
        name: 'rowCursorPointer',
        type: { name: 'boolean' },
        description: 'Whether to apply cursor pointer style to rows or not.',
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
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to apply invalid style to table or not.',
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
    getRowClassNames: {
        name: 'getRowClassNames',
        type: { name: 'function' },
        description: 'The function that receives row data and index as arguments, and returns class names for each row as an object.',
        defaultValue: undefined,
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
        defaultValue: undefined,
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
    },
    /* slots */
    headSlot: {
        name: 'head',
        description: 'Slot for inner HTML of thead.',
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
        defaultValue: null,
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
});
