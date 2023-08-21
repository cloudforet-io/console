import type { ArgTypes } from '@storybook/addons';

import { BALLOON_TAB_POSITION, BALLOON_TAB_SIZE, BALLOON_TAB_STYLE_TYPE } from '@/navigation/tabs/ballon-tab/config';

export const getBalloonTabArgTypes = (): ArgTypes => ({
    /* props */
    tabs: {
        name: 'tabs',
        type: { name: 'array' },
        description: `Tab items. 
        It is array of \`string\` or array of 
        \`{
          name: string; 
          label?: string; 
          keepAlive?: boolean;
        }\`
        .`,
        defaultValue: [
            { name: 'detail', label: 'Detail' },
            { name: 'info', label: 'Info' },
            { name: 'tags', label: 'Tags' },
        ],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    activeTab: {
        name: 'activeTab',
        type: { name: 'string', required: true },
        description: 'Active tab name. `sync` props.',
        defaultValue: 'detail',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    tail: {
        name: 'tail',
        type: { name: 'boolean' },
        description: 'Whether to show tail of each balloon or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Balloon style types. ${Object.values(BALLOON_TAB_STYLE_TYPE)} are available.`,
        defaultValue: BALLOON_TAB_STYLE_TYPE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BALLOON_TAB_STYLE_TYPE.primary}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BALLOON_TAB_STYLE_TYPE),
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Balloon size. ${Object.values(BALLOON_TAB_SIZE)} are available.`,
        defaultValue: BALLOON_TAB_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BALLOON_TAB_SIZE.md}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BALLOON_TAB_SIZE),
        },
    },
    position: {
        name: 'position',
        type: { name: 'string' },
        description: `Balloon position. ${Object.values(BALLOON_TAB_POSITION)} are available.`,
        defaultValue: BALLOON_TAB_POSITION.top,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BALLOON_TAB_POSITION.top}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BALLOON_TAB_POSITION),
        },
    },
    stretch: {
        name: 'stretch',
        type: { name: 'boolean' },
        description: 'Whether to stretch tab items or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    /* events */
    onUpdateActiveTab: {
        name: 'update:active-tab',
        description: 'Event emitted when activated tab changed. Works with `v-model` and `activeTab` props sync.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    onChange: {
        name: 'change',
        description: `Event emitted when activated tab changed.
        Two arguments will be given to the handler that bound to this event. 
        Changed tab item's name(\`string\`) will be given as the first, 
        and the index(\`number\`) will be given as the second argument.`,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
});
