import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { FavoriteType } from '@/store/modules/favorite/type';

import type { MenuId } from '@/lib/menu/config';

export const MENU_ITEM_TYPE = {
    TITLE: 'title',
    TOP_TITLE: 'top-title',
    ITEM: 'item',
    DIVIDER: 'divider',
    FAVORITE_ONLY: 'favorite-only',
} as const;
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface LNBItem {
    type: MenuItemType;
    label?: TranslateResult;
    id?: MenuId | string; // It can be change MenuId or etc.
    foldable?: boolean;
    to?: Location;
    isNew?: boolean;
    isBeta?: boolean;
    hideFavorite?: boolean;
    favoriteType?: FavoriteType;
    icon?: string;
}

export type LNBMenu = LNBItem[]|LNBItem;

export interface BackLink {
    label: TranslateResult;
    to: Location;
}

export interface TopTitle {
    icon?: string;
    label: string;
    visibleAddButton?: boolean;
    addButtonLink?: Location;
}
