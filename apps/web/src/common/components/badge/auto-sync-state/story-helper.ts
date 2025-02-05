
import type { ArgTypes, Parameters } from '@storybook/vue';

import { AUTO_SYNC_STATE_SIZE, AUTO_SYNC_STATE_STYLE_TYPE } from './constant';
import type { AutoSyncStateStyleType, AutoSyncStateSize } from './type';

export const getAutoSyncStateArgs = (): {
    state: AutoSyncStateStyleType;
    size: AutoSyncStateSize;
} => ({
    state: AUTO_SYNC_STATE_STYLE_TYPE.ENABLED,
    size: AUTO_SYNC_STATE_SIZE.MD,
});

export const getAutoSyncStateParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: '',
    },
});

export const getAutoSyncStateArgTypes = (): ArgTypes => ({
    state: {
        name: 'state',
        type: { name: 'string' },
        description: 'AutoSyncState state',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: AUTO_SYNC_STATE_STYLE_TYPE.ENABLED,
            },
        },
        control: 'select',
        options: Object.values(AUTO_SYNC_STATE_STYLE_TYPE),
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'AutoSyncState size',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: 'select',
        options: ['md', 'sm', 'lg'],
    },
});
