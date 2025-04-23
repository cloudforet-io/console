import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';


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
