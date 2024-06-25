import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';

import type { ProviderItem } from '@/store/reference/provider-reference-store';
import type { ReferenceMap } from '@/store/reference/type';

import type { SUMMARY_DATA_TYPE, BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';

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
export type ProviderResourceDataItem = ProviderItem & {
    server?: number;
    database?: number;
    storage?: number;
};
export type ProviderReferenceDataMap = ReferenceMap<ProviderResourceDataItem>;
export type SummaryDataType = typeof SUMMARY_DATA_TYPE[keyof typeof SUMMARY_DATA_TYPE];

// bookmark
export interface EmptyData {
    to?: { name: string };
    title: string | TranslateResult;
    buttonText?: string | TranslateResult;
    desc: string | TranslateResult;
}
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
