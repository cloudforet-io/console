import icon from 'vue-svgicon';

import { themes } from '@/data-display/status/config';
import { ANIMATION_TYPE } from '@/foundation/icons/config';


export const getStatusDefaultArgs = () => ({
    theme: 'green',
    icon: undefined,
    text: 'Enabled',
    textColor: undefined,
    iconColor: undefined,
    disableIcon: false,
    iconSize: 1,
    iconAnimation: undefined,
    defaultSlot: '',
});

export const getStatusArgTypes = () => ({
    theme: {
        name: 'theme',
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'string',
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
        type: 'boolean',
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
        type: 'number',
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
        type: 'string',
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
});
