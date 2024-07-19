import type { SBType } from '@storybook/types';
import type { ArgTypes, Args } from '@storybook/vue';

export const getTreeArgs = (): Args => ({
    toggleOptions: {},
    selectOptions: {},
    editOptions: {},
    dragOptions: {},
    dataGetter: undefined,
    dataSetter: undefined,
    dataFetcher: undefined,
    fetchOnInit: false,
    getClassNames: undefined,
});

export const getTreeArgTypes = (): ArgTypes => ({
    toggleOptions: {
        name: 'toggleOptions',
        type: { name: 'object' } as SBType,
        description: 'Options for toggle.',
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: 'object',
    },
    selectOptions: {
        name: 'selectOptions',
        type: { name: 'object' } as SBType,
        description: 'Options for toggle.',
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: 'object',
    },
    editOptions: {
        name: 'editOptions',
        type: { name: 'object' } as SBType,
        description: 'Options for inline edit.',
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: 'object',
    },
    dragOptions: {
        name: 'dragOptions',
        type: { name: 'object' } as SBType,
        description: 'Options for drag and drop.',
        table: {
            type: {
                summary: 'object',
            },
            defaultValue: {
                summary: '{}',
            },
            category: 'props',
        },
        control: 'object',
    },
    dataGetter: {
        name: 'dataGetter',
        type: { name: 'function' },
        description: 'Function that returns data to display.',
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: 'node => node.data',
            },
            category: 'props',
        },
        control: 'object',
    },
    dataSetter: {
        name: 'dataSetter',
        type: { name: 'function' },
        description: 'Function for setting children or node\'s data.',
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: '(d, node) => { node.data = d; }',
            },
            category: 'props',
        },
        control: 'object',
    },
    dataFetcher: {
        name: 'dataFetcher',
        type: { name: 'function' },
        description: 'Function for fetching nodes.',
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: 'undefined',
            },
            category: 'props',
        },
        control: 'object',
    },
    fetchOnInit: {
        name: 'fetchOnInit',
        type: { name: 'boolean' },
        description: 'Whether to fetch data on init tree or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            defaultValue: {
                summary: 'false',
            },
            category: 'props',
        },
        control: 'boolean',
    },
    getClassNames: {
        name: 'getClassNames',
        type: { name: 'function' },
        description: 'Function that returns class object to each node.',
        table: {
            type: {
                summary: 'function',
            },
            defaultValue: {
                summary: '() => ({})',
            },
            category: 'props',
        },
        control: 'object',
    },
    // default
    node: { table: { disable: true } },
    'left-extra': { table: { disable: true } },
    toggle: { table: { disable: true } },
    'toggle-right': { table: { disable: true } },
    icon: { table: { disable: true } },
    data: { table: { disable: true } },
    'right-extra': { table: { disable: true } },
});
