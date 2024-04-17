import type { ProviderItem } from '@/store/reference/provider-reference-store';
import type { ReferenceMap } from '@/store/reference/type';

import type { WORKSPACE_HOME_DATA_TYPE, BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';

export type WorkspaceHomeDataType = typeof WORKSPACE_HOME_DATA_TYPE[keyof typeof WORKSPACE_HOME_DATA_TYPE];

// summary
export interface CloudServiceData {
    cloud_service_group: string;
    cloud_service_type: string;
    total_count: number;
    icon: string;
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

// bookmark
export interface BookmarkItem {
    id?: string;
    name?: string;
    folder?: string;
    icon?: string;
    imgIcon?: string;
    link?: string;
    isShowMore?: boolean;
}
export type BookmarkModalType = typeof BOOKMARK_MODAL_TYPE[keyof typeof BOOKMARK_MODAL_TYPE];

