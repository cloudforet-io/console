import type { ArgTypes } from '@storybook/addons';

import { boardStandardItemSets } from '@/data-display/board/mock';
import { BOARD_STYLE_TYPE } from '@/data-display/board/type';

export const getBoardArgTypes = (): ArgTypes => ({
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Board style types. [${Object.values(BOARD_STYLE_TYPE)}] are available`,
        defaultValue: BOARD_STYLE_TYPE.list,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BOARD_STYLE_TYPE.list}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BOARD_STYLE_TYPE),
        },
    },
    styleOptions: {
        name: 'styleOptions',
        type: { name: 'object' },
        description: "Board style type's options. Each styleType has a different styleOptions. Optional props",
        defaultValue: {},
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
        type: { name: 'array' },
        description: 'Board items',
        defaultValue: boardStandardItemSets,
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
        defaultValue: 10,
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
        defaultValue: 10,
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
        name: 'itemContentSlot',
        description: 'Slot for board item content. This slot must be created in order to inject content into the board item.',
        defaultValue: 'Board Item Main Content',
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
        defaultValue: 'Board Item Left Content',
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
        defaultValue: 'Board Item Custom Right Content',
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
        defaultValue: 'Board Item Custom Item Overlay Content',
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
        defaultValue: null,
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
});
