
import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { DATA_TABLE_STYLE_TYPE, DATA_TABLE_TYPE } from '@/onboarding/data-table/config';
import { getUserData, getUserFields } from '@/onboarding/data-table/mock';

export const getOnboardingDataTableParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/design/AYgPGpuB1NxoG7KLL4d2oY/Onboarding-Data-Table?node-id=2-1660&node-type=frame&t=vs7upfzdCGRYyGhn-0',
    },
});

export const getOnboardingDataTableArgs = (): Args => ({
    loading: false,
    fields: getUserFields(),
    items: getUserData(),
    stripe: false,
    border: true,
    styleType: DATA_TABLE_STYLE_TYPE.default,
    showFooter: false,
    selectable: false,
    multiSelectable: false,
    selectIndex: [],
    getRowSelectable: undefined,
    type: DATA_TABLE_TYPE.default,
    columnCopyButton: false,
    headerLeftSlot: false,
    headerRightSlot: false,
    columnLeftSlot: false,
    columnRightSlot: false,
    disableHover: false,
    sortable: false,
    sortBy: undefined,
    sortDesc: true,

    noData: null,
});

export const getOnboardingDataTableArgTypes = (): ArgTypes => ({
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
    stripe: {
        name: 'stripe',
        type: { name: 'boolean' },
        description: 'Whether to separate rows by stripe background color or not.',
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
    border: {
        name: 'border',
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
    styleType: {
        name: 'styleType',
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
    showFooter: {
        name: 'showFooter',
        type: { name: 'boolean' },
        description: 'Whether to display foot or not. Edit the slot `footer` or `tf-col-format` to see details.',
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
    multiSelectable: {
        name: 'multiSelectable',
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
    type: {
        name: 'type',
        type: { name: 'string' },
        description: `Type for table. You can choose between ${Object.values(DATA_TABLE_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DATA_TABLE_TYPE.default,
            },
        },
        control: 'select',
        options: Object.values(DATA_TABLE_TYPE),
    },
    columnCopyButton: {
        name: 'columnCopyButton',
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

    /* slots */
    headerLeftSlot: {
        name: 'headerLeftSlot',
        type: { name: 'boolean' },
        description: 'Whether to show left slot in the header or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
    },
    headerRightSlot: {
        name: 'headerRightSlot',
        type: { name: 'boolean' },
        description: 'Whether to show right slot in the header or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
    },
    columnLeftSlot: {
        name: 'columnLeftSlot',
        type: { name: 'boolean' },
        description: 'Whether to show left slot in the column or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
    },
    columnRightSlot: {
        name: 'columnRightSlot',
        type: { name: 'boolean' },
        description: 'Whether to show right slot in the column or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
    },
    noData: {
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

    /* events */
    onRowClick: {
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
});
