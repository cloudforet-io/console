import { TranslateResult } from 'vue-i18n';
import { Location } from 'vue-router';

import { FavoriteType } from '@/store/modules/favorite/type';

import { MenuId } from '@/lib/menu/config';

export const MENU_ITEM_TYPE = Object.freeze({
    TITLE: 'title',
    ITEM: 'item',
    DIVIDER: 'divider',
} as const);
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface LNBItem {
    type: MenuItemType;
    label?: TranslateResult;
    id?: MenuId;
    foldable?: boolean;
    to?: Location;
    isNew?: boolean;
    isBeta?: boolean;
    hideFavorite?: boolean;
    favoriteType?: FavoriteType;
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
