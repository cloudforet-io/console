import type { ArgTypes } from '@storybook/addons';
import VueRouter from 'vue-router';

import { ACTION_ICON, LinkSize } from '@/inputs/link/type';


export const getLinkArgTypes = (): ArgTypes => ({
    text: {
        name: 'text',
        type: { name: 'string' },
        description: 'Link text. It will be replaced by default slot if exists.',
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
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Disable link or not',
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
        description: 'Fix link color for highlighting, not inherit parent\'s color.',
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
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Select link size. ${
            [...Object.values(LinkSize)].map((d) => `\`${d}\``)} are available.`,
        defaultValue: LinkSize.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: LinkSize.md,
            },
        },
        control: {
            type: 'select',
            options: [...Object.values(LinkSize)],
        },
    },
    leftIcon: {
        name: 'leftIcon',
        type: { name: 'string' },
        description: 'The name of left icon to be displayed.',
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
            type: 'text',
        },
    },
    actionIcon: {
        name: 'actionIcon',
        type: { name: 'string' },
        description: 'Action icon that will appear to the right of the link text.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: ACTION_ICON.NONE,
            },
        },
        control: {
            type: 'select',
            options: Object.values(ACTION_ICON),
        },
    },
    newTab: {
        name: 'newTab',
        type: { name: 'boolean' },
        description: 'Whether to open the link in a new tab or not.',
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

export const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: { template: '<div/>' },
        },
    ],
});
