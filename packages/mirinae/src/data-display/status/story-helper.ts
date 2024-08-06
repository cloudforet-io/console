import type { ArgTypes, Parameters, Args } from '@storybook/vue';
import icon from 'vue-svgicon';


import { themes } from '@/data-display/status/config';
import { ANIMATION_TYPE } from '@/foundation/icons/config';

export const getStatusParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124044',
    },
});

export const getStatusArgs = (): Args => ({
    theme: 'green',
    icon: null,
    text: 'Enabled',
    textColor: null,
    iconColor: null,
    disableIcon: false,
    iconSize: 1,
    iconAnimation: undefined,
    defaultSlot: '',
});

export const getStatusArgTypes = (): ArgTypes => ({
    theme: {
        name: 'theme',
        type: { name: 'string' },
        description: 'Status theme',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'select',
        options: [null, ...themes],
    },
    icon: {
        name: 'icon',
        type: { name: 'string' },
        description: 'Icon name',
        defaultValue: null,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'select',
        options: [null, ...Object.keys(icon.icons)],
    },
    text: {
        name: 'text',
        type: { name: 'string' },
        description: 'Text',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Enabled',
            },
        },
        control: 'text',
    },
    textColor: {
        name: 'textColor',
        type: { name: 'string' },
        description: 'Text color',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'color',
    },
    iconColor: {
        name: 'iconColor',
        type: { name: 'string' },
        description: 'Icon color',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'color',
    },
    disableIcon: {
        name: 'disableIcon',
        type: { name: 'boolean' },
        description: 'Disable icon when true',
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
    iconSize: {
        name: 'iconSize',
        type: { name: 'number' },
        description: 'Icon size',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 1,
            },
        },
        control: 'number',
    },
    iconAnimation: {
        name: 'iconAnimation',
        type: { name: 'string' },
        description: `Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
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
        options: Object.values(ANIMATION_TYPE),
    },
    defaultSlot: {
        name: 'default',
        description: 'Slot for text.',
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
