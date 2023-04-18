import type { ArgTypes } from '@storybook/addons';

export const getTreeArgTypes = (): ArgTypes => ({
    toggleOptions: {
        name: 'toggleOptions',
        type: { name: 'object' },
        description: 'Options for toggle.',
        defaultValue: {},
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    selectOptions: {
        name: 'selectOptions',
        type: { name: 'object' },
        description: 'Options for toggle.',
        defaultValue: {},
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    editOptions: {
        name: 'editOptions',
        type: { name: 'object' },
        description: 'Options for inline edit.',
        defaultValue: {},
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    dragOptions: {
        name: 'dragOptions',
        type: { name: 'object' },
        description: 'Options for drag and drop.',
        defaultValue: {},
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    dataGetter: {
        name: 'dataGetter',
        type: { name: 'function' },
        description: 'Function that returns data to display.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: 'node => node.data',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    dataSetter: {
        name: 'dataSetter',
        type: { name: 'function' },
        description: 'Function for setting children or node\'s data.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: '(d, node) => { node.data = d; }',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    dataFetcher: {
        name: 'dataFetcher',
        type: { name: 'function' },
        description: 'Function for fetching nodes.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
    fetchOnInit: {
        name: 'fetchOnInit',
        type: { name: 'boolean' },
        description: 'Whether to fetch data on init tree or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: 'false',
            },
            category: 'props',
        },
        control: {
            type: 'boolean',
        },
    },
    getClassNames: {
        name: 'getClassNames',
        type: { name: 'function' },
        description: 'Function that returns class object to each node.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: '() => ({})',
            },
            category: 'props',
        },
        control: {
            type: 'object',
        },
    },
});
