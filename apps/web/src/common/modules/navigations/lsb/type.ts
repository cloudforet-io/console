import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';


import type { MenuId } from '@/lib/menu/config';

import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';


export const MENU_ITEM_TYPE = {
    TOP_TITLE: 'top-title',
    BUTTON_TITLE: 'button-title',
    DROPDOWN: 'dropdown',
    STARRED: 'starred',
    DIVIDER: 'divider',
    ITEM: 'item',
    COLLAPSIBLE: 'collapsible',
    SLOT: 'slot',
} as const;
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface SelectOptions {
    items: MenuItem[];
    defaultSelected?: string | number;
}

export type LSBIcon = string | { name: string; color?: string; };
export type highlightTagType = 'new' | 'beta' | 'update';

export interface LSBItem {
    type: MenuItemType;
    label?: TranslateResult;
    id?: MenuId | string; // It can be change MenuId or etc.
    foldable?: boolean;
    to?: Location;
    highlightTag?: highlightTagType;
    hideFavorite?: boolean;
    favoriteOptions?: FavoriteOptions;
    icon?: LSBIcon;
    imgIcon?: string;
    titleIcon?: string;
    selectOptions?: SelectOptions;
    childItems?: LSBItem[];
    currentPath?: string;
    isBackLink?: boolean;
    isSub?: boolean;
    subText?: string;
    initialCollapsed?: boolean; // for collapsible LSB item
}

export interface LSBCollapsibleItem<T = any> extends LSBItem {
    subItems?: T[];
}

export type LSBMenu = LSBItem[]|LSBItem;

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
