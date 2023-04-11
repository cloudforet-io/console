import type { ArgTypes } from '@storybook/addons';
import icon from 'vue-svgicon';

import { themes } from '@/data-display/status/config';
import { ANIMATION_TYPE } from '@/foundation/icons/config';


export const getStatusArgTypes = (): ArgTypes => ({
    theme: {
        name: 'theme',
        type: { name: 'string' },
        description: 'Status theme',
        defaultValue: 'green',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'null',
            },
        },
        control: {
            type: 'select',
            options: [null, ...themes],
        },
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
        control: {
            type: 'select',
            options: [null, ...Object.keys(icon.icons)],
        },
    },
    text: {
        name: 'text',
        type: { name: 'string' },
        description: 'Text',
        defaultValue: 'Enabled',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'Enabled',
            },
        },
        control: {
            type: 'text',
        },
    },
    textColor: {
        name: 'textColor',
        type: { name: 'string' },
        description: 'Text color',
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
        control: {
            type: 'color',
        },
    },
    iconColor: {
        name: 'iconColor',
        type: { name: 'string' },
        description: 'Icon color',
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
        control: {
            type: 'color',
        },
    },
    disableIcon: {
        name: 'disableIcon',
        type: { name: 'boolean' },
        description: 'Disable icon when true',
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
    iconSize: {
        name: 'iconSize',
        type: { name: 'number' },
        description: 'Icon size',
        defaultValue: 1,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 1,
            },
        },
        control: {
            type: 'number',
        },
    },
    iconAnimation: {
        name: 'iconAnimation',
        type: { name: 'string' },
        description: `Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
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
            options: Object.values(ANIMATION_TYPE),
        },
    },
    defaultSlot: {
        name: 'default',
        description: 'Slot for text.',
        defaultValue: '',
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
