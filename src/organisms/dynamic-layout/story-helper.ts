export const argTypes = {
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
    listMap: {
        name: 'listMap',
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
};
