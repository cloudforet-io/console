import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type { FavoriteType } from '@/store/modules/favorite/type';

import type { MenuId } from '@/lib/menu/config';

export const MENU_ITEM_TYPE = {
    TITLE: 'title',
    TOP_TITLE: 'top-title',
    ITEM: 'item',
    DIVIDER: 'divider',
    FAVORITE_ONLY: 'favorite-only',
    DROPDOWN: 'dropdown',
} as const;
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface SelectOptions {
    items: MenuItem[];
    defaultSelected?: string | number;
}

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
    selectOptions?: SelectOptions;
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
