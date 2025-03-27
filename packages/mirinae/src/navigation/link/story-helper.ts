import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';
import VueRouter from 'vue-router';

import { ACTION_ICON, LinkSize } from '@/navigation/link/type';

export const getLinkArgs = (): Args => ({
    text: 'Hello World',
    disabled: false,
    highlight: false,
    size: LinkSize.md,
    iconLeft: undefined,
    actionIcon: undefined,
    newTab: false,
    href: 'https://cloudforet.io',
    to: undefined,
    useAnchorScroll: false,
    lineHeight: undefined,
    defaultSlot: null,

});

export const getLinkParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=7050%3A551812',
    },
});

export const getLinkArgTypes = (): ArgTypes => ({
    text: {
        name: 'text',
        type: { name: 'string' },
        description: 'Link text. It will be replaced by default slot if exists.',
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
        control: 'boolean',
    },
    highlight: {
        name: 'highlight',
        type: { name: 'boolean' },
        description: 'Fix link color for highlighting, not inherit parent\'s color.',
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
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Select link size. ${
            [...Object.values(LinkSize)].map((d) => `\`${d}\``)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: LinkSize.md,
            },
        },
        control: 'select',
        options: [...Object.values(LinkSize)],
    },
    iconLeft: {
        name: 'iconLeft',
        type: { name: 'string' },
        description: 'The name of left icon to be displayed.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    actionIcon: {
        name: 'actionIcon',
        type: { name: 'string' },
        description: 'Action icon that will appear to the right of the link text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: ACTION_ICON.NONE,
            },
        },
        control: 'select',
        options: Object.values(ACTION_ICON),
    },
    newTab: {
        name: 'newTab',
        type: { name: 'boolean' },
        description: 'Whether to open the link in a new tab or not.',
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
    href: {
        name: 'href',
        type: { name: 'string' },
        description: 'href',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
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
    useAnchorScroll: {
        name: 'useAnchorScroll',
        type: { name: 'boolean' },
        description: "Whether to use 'a' tag's scroll to specific element or not.",
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
    lineHeight: {
        name: 'lineHeight',
        type: { name: 'string' },
        description: 'Line height of link text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    defaultSlot: {
        name: 'default',
        description: 'Slot for text',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    // default
    default: { table: { disable: true } },
});

export const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: { template: '<div/>' },
        },
    ],
});
