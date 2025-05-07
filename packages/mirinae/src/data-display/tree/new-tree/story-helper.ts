import type { ArgTypes, Parameters, Args } from '@storybook/vue';

export const getTreeNodeArgs = (): Args => ({
    id: 'tree-node-1',
    name: 'Tree Node',
    icon: {
        icon: 'ic_tree_folder',
        color: 'inherit',
    },
    displayType: 'tree',
    selectable: true,
    draggable: false,
    depth: 0,
    expanded: false,
    loading: false,
    hasChildren: true,
    link: undefined,
    selected: false,
});

export const getTreeNodeParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5307%3A179428',
    },
});

export const getTreeNodeArgTypes = (): ArgTypes => ({
    // Props
    id: {
        name: 'id',
        type: { name: 'string' },
        description: 'Unique identifier for the tree node',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
        },
        control: 'text',
    },
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'Display name of the tree node',
        table: {
            type: {
                summary: 'string | TranslateResult',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    icon: {
        name: 'icon',
        type: { name: 'object', value: {} },
        description: 'Icon configuration for the tree node',
        table: {
            type: {
                summary: 'TreeNodeIcon',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    displayType: {
        name: 'displayType',
        type: { name: 'string' },
        description: 'Display type of the tree node',
        table: {
            type: {
                summary: 'TreeNodeDisplayType',
            },
            category: 'props',
            defaultValue: {
                summary: '"tree"',
            },
        },
        control: 'select',
        options: ['tree', 'item'],
    },
    selectable: {
        name: 'selectable',
        type: { name: 'boolean' },
        description: 'Whether the tree node is selectable',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    draggable: {
        name: 'draggable',
        type: { name: 'boolean' },
        description: 'Whether the tree node is draggable',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    depth: {
        name: 'depth',
        type: { name: 'number' },
        description: 'Depth level of the tree node (works only when displayType is "tree")',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: 'number',
    },
    expanded: {
        name: 'expanded',
        type: { name: 'boolean' },
        description: 'Whether the tree node is expanded',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether the tree node is in loading state',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    hasChildren: {
        name: 'hasChildren',
        type: { name: 'boolean' },
        description: 'Whether the tree node has children',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    link: {
        name: 'link',
        type: { name: 'object', value: {} },
        description: 'Router link configuration (works only when selectable is true)',
        table: {
            type: {
                summary: 'TreeNodeLink',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    selected: {
        name: 'selected',
        type: { name: 'boolean' },
        description: 'Whether the tree node is selected (works only when selectable is true)',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },

    // Slots
    'outer-left': {
        name: 'outer-left',
        description: 'Slot for content to be placed at the outer left side of the node',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    'inner-left': {
        name: 'inner-left',
        description: 'Slot for content to be placed at the inner left side of the node (after icon)',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    'inner-right': {
        name: 'inner-right',
        description: 'Slot for content to be placed at the inner right side of the node (after text)',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    'outer-right': {
        name: 'outer-right',
        description: 'Slot for content to be placed at the outer right side of the node',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    action: {
        name: 'action',
        description: 'Slot for action buttons that appear on hover',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    children: {
        name: 'children',
        description: 'Slot for child nodes',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    default: {
        name: 'default',
        description: 'Default slot for customizing the node text content',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },

    // Events
    'update:selected': {
        name: 'update:selected',
        description: 'Emitted when the node selection state changes',
        table: {
            type: {
                summary: '(value: boolean) => void',
            },
            category: 'events',
        },
    },
    'update:expanded': {
        name: 'update:expanded',
        description: 'Emitted when the node expanded state changes',
        table: {
            type: {
                summary: '(value: boolean) => void',
            },
            category: 'events',
        },
    },
});
