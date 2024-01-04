import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';


import type { FavoriteOptions } from '@/store/modules/favorite/type';

import type { MenuId } from '@/lib/menu/config';

export const MENU_ITEM_TYPE = {
    TITLE: 'title',
    TOP_TITLE: 'top-title',
    ITEM: 'item',
    DIVIDER: 'divider',
    FAVORITE_ONLY: 'favorite-only',
    DROPDOWN: 'dropdown',
    SLOT: 'slot',
} as const;
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface SelectOptions {
    items: MenuItem[];
    defaultSelected?: string | number;
}

export type LNBIcon = string | { name: string; color?: string; };
export type hightlightTagType = 'new' | 'beta' | 'update';

export interface LNBItem {
    type: MenuItemType;
    label?: TranslateResult;
    id?: MenuId | string; // It can be change MenuId or etc.
    foldable?: boolean;
    to?: Location;
    highlightTag?: hightlightTagType;
    hideFavorite?: boolean;
    favoriteOptions?: FavoriteOptions;
    icon?: LNBIcon;
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
