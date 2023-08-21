import type { ArgTypes } from '@storybook/addons';
import { createRouter, createWebHistory } from 'vue-router';

import { AnchorSize, IconPosition } from '@/inputs/anchors/type';

export const getAnchorsArgTypes = (): ArgTypes => ({
    text: {
        name: 'text',
        type: { name: 'string' },
        description: 'Anchor text. It will be replaced by default slot if exists.',
        defaultValue: 'Hello World',
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
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Select anchor size. ${
            [...Object.values(AnchorSize)].map((d) => `\`${d}\``)} are available.`,
        defaultValue: AnchorSize.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: AnchorSize.md,
            },
        },
        control: {
            type: 'select',
            options: [...Object.values(AnchorSize)],
        },
    },
    iconPosition: {
        name: 'iconPosition',
        type: { name: 'string' },
        description: `Select icon position. ${
            [...Object.values(IconPosition)].map((d) => `\`${d}\``)} are available.`,
        defaultValue: IconPosition.right,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: IconPosition.right,
            },
        },
        control: {
            type: 'select',
            options: [...Object.values(IconPosition)],
        },
    },
    hideIcon: {
        name: 'hideIcon',
        type: { name: 'boolean' },
        description: 'Whether or not hide icon.',
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
    iconName: {
        name: 'iconName',
        type: { name: 'string' },
        description: 'The name of the icon to be displayed. Opens as a new tab only if you use the `ic_external-link` icon.',
        defaultValue: 'ic_external-link',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_external-link',
            },
        },
        control: {
            type: 'text',
        },
    },
    href: {
        name: 'href',
        type: { name: 'string' },
        description: 'href',
        defaultValue: 'https://cloudforet.io',
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
        description: 'Disable anchor or not',
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
    highlight: {
        name: 'highlight',
        type: { name: 'boolean' },
        description: 'Fix anchor color for highlighting, not inherit parent\'s color.',
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
    defaultSlot: {
        name: 'default',
        description: 'Slot for text',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
});

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: { template: '<div/>' },
        },
    ],
});
