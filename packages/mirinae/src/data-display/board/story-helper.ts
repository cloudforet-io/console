import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { boardStandardItemSets } from '@/data-display/board/mock';
import { BOARD_STYLE_TYPE } from '@/data-display/board/type';


export const getBoardArgs = (): Args => ({
    styleType: BOARD_STYLE_TYPE.list,
    styleOptions: {},
    boardSets: boardStandardItemSets,
    pageLimit: 10,
    selectable: 10,
});

export const getBoardParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'figma url',
    },
});

export const getBoardArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Board style types. [${Object.values(BOARD_STYLE_TYPE)}] are available`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BOARD_STYLE_TYPE.list}"`,
            },
        },
        control: 'select',
        options: Object.values(BOARD_STYLE_TYPE),
    },
    styleOptions: {
        name: 'styleOptions',
        type: { name: 'object' } as SBType,
        description: "Board style type's options. Each styleType has a different styleOptions. Optional props",
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
    },
    boardSets: {
        name: 'boardSets',
        type: { name: 'array' } as SBType,
        description: 'Board items',
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
    pageLimit: {
        name: 'pageLimit',
        type: { name: 'number' },
        description: '',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 10,
            },
        },
    },
    selectable: {
        name: 'selectable',
        type: { name: 'boolean' },
        description: '',
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
    // slots
    itemContentSlot: {
        name: 'item-content',
        description: 'Slot for board item content. This slot must be created in order to inject content into the board item.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Main Content',
        },
    },
    itemLeftContentSlot: {
        name: 'itemLeftContentSlot',
        description: "Slot to replace board item's left icon",
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Left Content',
        },
    },
    itemCustomRightContentSlot: {
        name: 'itemCustomRightContentSlot',
        description: "Slot to replace board item's right-icon-button-content to custom content",
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Custom Right Content',
        },
    },
    itemOverlayContentSlot: {
        name: 'itemOverlayContentSlot',
        description: "Slot to replace board item's overlay-content to custom content",
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: 'Board Item Custom Item Overlay Content',
        },
    },
    // events
    itemClick: {
        name: 'item-click',
        description: 'This event is emitted when board item is clicked.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    // default
    'item-content': { table: { disable: true } },
    'item-left-content': { table: { disable: true } },
    'item-custom-right-content': { table: { disable: true } },
    'item-overlay-content': { table: { disable: true } },
});
