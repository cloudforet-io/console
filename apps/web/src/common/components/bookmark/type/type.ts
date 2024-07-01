import type { TranslateResult } from 'vue-i18n';

import type { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';

import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

export interface BookmarkItem {
    id?: string;
    name?: string | TranslateResult;
    folder?: string;
    icon?: string;
    imgIcon?: string;
    link?: string;
    isShowMore?: boolean;
    workspaceId?: string;
    isGlobal?: boolean;
}

export type BookmarkModalType = typeof BOOKMARK_MODAL_TYPE[keyof typeof BOOKMARK_MODAL_TYPE];

export type BookmarkModalStateType = {
    type?: BookmarkModalType;
    isNew?: boolean;
    isEdit?: boolean;
};

export type RadioType = {
    label: TranslateResult,
    name: BookmarkType
};
