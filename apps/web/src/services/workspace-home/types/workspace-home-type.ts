import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';

// summary

export const DEFAULT_PADDING = 24;
export interface CloudServiceData {
    cloud_service_group: string;
    cloud_service_type: string;
    total_count: number;
    icon?: string;
    provider: string;
    created_count: number;
    deleted_count: number;
    create_warning?: boolean;
    delete_warning?: boolean;
    display_name?: string;
}
export type DailyUpdatesListItem = {
    created: CloudServiceData[],
    deleted: CloudServiceData[],
};

// bookmark
export interface MoreMenuItem extends MenuItem {
    workspaceId?: string;
}
export type BookmarkType = typeof BOOKMARK_TYPE[keyof typeof BOOKMARK_TYPE];

// configs
export type StarredServiceItem = {
    icon: string;
    label: TranslateResult;
    to: string;
};
