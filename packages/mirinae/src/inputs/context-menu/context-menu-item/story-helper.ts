import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

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

export const getContextMenuItemArgs = (): Args => ({
    name: 'name',
    label: 'label',
    link: '',
    to: undefined,
    disabled: false,
    selected: false,
    selectMarker: undefined,
    ellipsis: false,
    highlightTerm: 'highlight',
    icon: undefined,
    iconColor: undefined,
    imageUrl: undefined,
    default: null,
    'text-list': null,
    'all native events': null,
});

export const getContextMenuItemParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getContextMenuItemArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'The key of item. must be unique.',
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
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'The display label of item.',
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
        control: 'text',
    },
    to: {
        name: 'to',
        type: { name: 'object' } as SBType,
        description: 'Vue Router `Location`.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Whether the item is clickable(selectable) or not.',
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
    selected: {
        name: 'selected',
        type: { name: 'boolean' },
        description: 'Whether the item is selected or not.',
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
    selectMarker: {
        name: 'selectMarker',
        type: { name: 'string' },
        description: `Whether to show checkbox, radio, or nothing. ${SELECT_MARKERS.map((d) => `\`${d}\``).join(', ')}, \`undefined\` are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'select',
        options: [...SELECT_MARKERS, undefined],
    },
    ellipsis: {
        name: 'ellipsis',
        type: { name: 'boolean' },
        description: 'Whether to ellipsis label text or not.',
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
    highlightTerm: {
        name: 'highlightTerm',
        type: { name: 'string' },
        description: 'The term for highlighting part of the label.',
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
    icon: {
        name: 'icon',
        type: { name: 'string' },
        description: 'Icon in Left Content Area.',
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
    iconColor: {
        name: 'iconColor',
        type: { name: 'string' },
        description: 'Color of icon in Left Content Area.',
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
    imageUrl: {
        name: 'imageUrl',
        type: { name: 'string' },
        description: 'Image url in Left Content Area.',
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
    ...getArgTypes('slots', slots),
    ...getArgTypes('events', events),

    // default
    default: { table: { disable: true } },
    'text-list': { table: { disable: true } },
});
