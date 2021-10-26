import { ArgTypes } from '@storybook/addons';
import VueRouter from 'vue-router';

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
    showIcon: {
        name: 'showIcon',
        type: { name: 'boolean' },
        description: 'Indicator of visibility of icon which is visible only when target is blank.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
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
        defaultValue: '/',
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
    target: {
        name: 'target',
        type: { name: 'string' },
        description: 'a tag target attribute',
        defaultValue: '_blank',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"_blank"',
            },
        },
        control: {
            type: 'text',
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
    leftExtraSlot: {
        name: 'left-extra',
        description: 'Slot for left side of text',
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
    },
    iconSlot: {
        name: 'icon',
        description: 'Slot for icon',
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
