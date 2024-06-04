import type { TranslateResult } from 'vue-i18n';

import type { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';

export interface BookmarkItem {
    id?: string;
    name?: string | TranslateResult;
    folder?: string;
    icon?: string;
    imgIcon?: string;
    link?: string;
    isShowMore?: boolean;
    workspaceId?: string;
}

export type BookmarkModalType = typeof BOOKMARK_MODAL_TYPE[keyof typeof BOOKMARK_MODAL_TYPE];

export type BookmarkModalStateType = {
    type?: BookmarkModalType;
    isNew?: boolean;
    isEdit?: boolean;
};
