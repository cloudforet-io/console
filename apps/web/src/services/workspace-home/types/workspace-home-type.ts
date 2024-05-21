import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import type { ProviderItem } from '@/store/reference/provider-reference-store';
import type { ReferenceMap } from '@/store/reference/type';

import type { WORKSPACE_HOME_DATA_TYPE, BOOKMARK_MODAL_TYPE, SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';

export type WorkspaceHomeDataType = typeof WORKSPACE_HOME_DATA_TYPE[keyof typeof WORKSPACE_HOME_DATA_TYPE];

// summary
export interface CloudServiceData {
    cloud_service_group: string;
    cloud_service_type: string;
    total_count: number;
    icon?: string;
    provider: string;
    created_count: number;
    deleted_count: number;
    create_warning: boolean;
    delete_warning: boolean;
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
export interface BookmarkItem {
    id?: string;
    name?: string | TranslateResult;
    folder?: string;
    icon?: string;
    imgIcon?: string;
    link?: string;
    isShowMore?: boolean;
    workspaceId?: string;
    isManaged?: boolean;
}
export type BookmarkModalType = typeof BOOKMARK_MODAL_TYPE[keyof typeof BOOKMARK_MODAL_TYPE];
export type BookmarkBoardSet = BookmarkItem & BoardSet;

export type BookmarkModalStateType = {
    type?: BookmarkModalType;
    isNew?: boolean;
    isEdit?: boolean;
};

export interface EmptyData {
    to?: { name: string };
    title: string | TranslateResult;
    buttonText?: string | TranslateResult;
    desc: string | TranslateResult;
}
export interface MoreMenuItem extends MenuItem {
    workspaceId?: string;
}

// configs
export type StarredServiceItem = {
    icon: string;
    label: TranslateResult;
    to: string;
};
