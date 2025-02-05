import type { AUTO_SYNC_STATE_STYLE_TYPE, AUTO_SYNC_STATE_SIZE } from '@/common/components/badge/auto-sync-state/constant';


export type AutoSyncStateStyleType = typeof AUTO_SYNC_STATE_STYLE_TYPE[keyof typeof AUTO_SYNC_STATE_STYLE_TYPE];

export type AutoSyncStateSize = typeof AUTO_SYNC_STATE_SIZE[keyof typeof AUTO_SYNC_STATE_SIZE];
