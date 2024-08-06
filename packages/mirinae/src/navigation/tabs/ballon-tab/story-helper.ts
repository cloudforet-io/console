import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { BALLOON_TAB_POSITION, BALLOON_TAB_SIZE, BALLOON_TAB_STYLE_TYPE } from '@/navigation/tabs/ballon-tab/config';

export const getBalloonTabParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getBalloonTabArgs = (): Args => ({
    tabs: [
        { name: 'detail', label: 'Detail' },
        { name: 'info', label: 'Info' },
        { name: 'tags', label: 'Tags' },
    ],
    activeTab: 'detail',
    tail: false,
    styleType: BALLOON_TAB_STYLE_TYPE.primary,
    position: BALLOON_TAB_POSITION.top,
    size: BALLOON_TAB_SIZE.md,
    stretch: false,
});

export const getBalloonTabArgTypes = (): ArgTypes => ({
    /* props */
    tabs: {
        name: 'tabs',
        type: { name: 'array' } as SBType,
        description: `Tab items. 
        It is array of \`string\` or array of 
        \`{
          name: string; 
          label?: string; 
          keepAlive?: boolean;
        }\`
        .`,
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
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
        control: 'text',
    },
    tail: {
        name: 'tail',
        type: { name: 'boolean' },
        description: 'Whether to show tail of each balloon or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Balloon style types. ${Object.values(BALLOON_TAB_STYLE_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BALLOON_TAB_STYLE_TYPE.primary}"`,
            },
        },
        control: 'select',
        options: Object.values(BALLOON_TAB_STYLE_TYPE),
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Balloon size. ${Object.values(BALLOON_TAB_SIZE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BALLOON_TAB_SIZE.md}"`,
            },
        },
        control: 'select',
        options: Object.values(BALLOON_TAB_SIZE),
    },
    position: {
        name: 'position',
        type: { name: 'string' },
        description: `Balloon position. ${Object.values(BALLOON_TAB_POSITION)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BALLOON_TAB_POSITION.top}"`,
            },
        },
        control: 'select',
        options: Object.values(BALLOON_TAB_POSITION),
    },
    stretch: {
        name: 'stretch',
        type: { name: 'boolean' },
        description: 'Whether to stretch tab items or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    /* events */
    onUpdateActiveTab: {
        name: 'update:activeTab',
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
    tab: { table: { disable: true } },
    default: { table: { disable: true } },
    'v-model': { table: { disable: true } },
});
