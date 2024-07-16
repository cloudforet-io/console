export const getTreeDefaultArgs = () => ({
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

export const getTreeArgTypes = () => ({
    toggleOptions: {
        name: 'toggleOptions',
        type: 'object',
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
        type: 'object',
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
        type: 'object',
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
        type: 'object',
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
        type: 'function',
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
        type: 'function',
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
        type: 'function',
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
        type: 'boolean',
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
        type: 'function',
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
});
