import { ArgTypes } from '@storybook/addons';
import { argTypes as tabArgTypes, Inner } from '@/hooks/tab/story-helper';
import { BALLOON_TAB_POSITION, BALLOON_TAB_SIZE, BALLOON_TAB_STYLE_TYPE } from '@/navigation/tabs/ballon-tab/config';

export const argTypes: ArgTypes = {
    ...tabArgTypes,
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
};
export { Inner };
