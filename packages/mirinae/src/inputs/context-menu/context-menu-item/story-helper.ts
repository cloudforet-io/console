import type { ArgTypes } from '@storybook/addons';

import { SELECT_MARKERS } from '@/inputs/context-menu/context-menu-item/config';

const slots: [string, string][] = [
    ['default', 'The slot for item. Default style will be applied.'],
    ['text-list', 'The slot for item. Default style will bel applied. This works only when the highlightTerm is given.'],
];

const events: [string, string][] = [
    ['all native events', 'All native events are available.'],
];

const getArgTypes = (category: string, info: [string, string][]) => {
    const argTypes: ArgTypes = {};
    info.forEach(([argName, argDescription]) => {
        let name = argName;
        if (category === 'slots') name = `${argName}Slot`;
        else if (category === 'events') name = `on${argName[0].toUpperCase()}${argName.slice(1)}`;
        argTypes[name] = {
            name: argName,
            description: argDescription,
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                category,
                defaultValue: {
                    summary: null,
                },
            },
        };
    });
    return argTypes;
};

export const getContextMenuItemArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'The key of item. must be unique.',
        defaultValue: 'name',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'The display label of item.',
        defaultValue: 'label',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    link: {
        name: 'link',
        type: { name: 'string' },
        description: 'The external link of item.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    to: {
        name: 'to',
        type: { name: 'object' },
        description: 'Vue Router `Location`.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'object',
        },
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Whether the item is clickable(selectable) or not.',
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
    selected: {
        name: 'selected',
        type: { name: 'boolean' },
        description: 'Whether the item is selected or not.',
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
        control: {
            type: 'boolean',
        },
    },
    selectMarker: {
        name: 'selectMarker',
        type: { name: 'string' },
        description: `Whether to show checkbox, radio, or nothing. ${SELECT_MARKERS.map((d) => `\`${d}\``).join(', ')}, \`undefined\` are available.`,
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'select',
            options: [...SELECT_MARKERS, undefined],
        },
    },
    ellipsis: {
        name: 'ellipsis',
        type: { name: 'boolean' },
        description: 'Whether to ellipsis label text or not.',
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
        control: {
            type: 'boolean',
        },
    },
    highlightTerm: {
        name: 'highlightTerm',
        type: { name: 'string' },
        description: 'The term for highlighting part of the label.',
        defaultValue: 'highlight',
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
    icon: {
        name: 'icon',
        type: { name: 'string' },
        description: 'Icon in Left Content Area.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    imageUrl: {
        name: 'imageUrl',
        type: { name: 'string' },
        description: 'Image url in Left Content Area.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    ...getArgTypes('slots', slots),
    ...getArgTypes('events', events),
});
