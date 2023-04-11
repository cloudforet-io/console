import type { ArgTypes } from '@storybook/addons';
import icon from 'vue-svgicon';

import {
    standardIconActionSet,
} from '@/data-display/board-item/mock';

export const getBoardItemArgTypes = (): ArgTypes => ({
    leftIcon: {
        name: 'leftIcon',
        type: { name: 'string' },
        description: 'Icon name in Left Content Area.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_refresh',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(icon.icons),
        },
    },
    iconButtonSets: {
        name: 'iconButtonSets',
        type: { name: 'array' },
        description: 'Array of icon-button-set that will fit into the right overlay content area',
        defaultValue: standardIconActionSet,
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
    },
    rounded: {
        name: 'rounded',
        type: { name: 'boolean' },
        description: 'Use `border-radius` style of the card item.',
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
        description: 'Selected style',
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
    // slots
    contentSlot: {
        name: 'content',
        description: 'Slot for main contents',
        defaultValue: 'Board Item Main Content',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Main Content',
        },
    },
    leftContentSlot: {
        name: 'leftContent',
        description: 'Slot to replace left icon',
        defaultValue: 'Board Item Left Content',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Left Content',
        },
    },
    customRightContentSlot: {
        name: 'customRightContentSlot',
        description: 'Slot to replace right-icon-button-content to custom content',
        defaultValue: 'Board Item Custom Right Content',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Custom Right Content',
        },
    },
});
