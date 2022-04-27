import { Location } from 'vue-router';
import { MenuId } from '@/lib/menu/config';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

export const MENU_ITEM_TYPE = Object.freeze({
    TITLE: 'title',
    ITEM: 'item',
    DIVIDER: 'divider',
} as const);
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface LNBItem {
    type: MenuItemType;
    label?: string;
    id?: MenuId;
    foldable?: boolean;
    to?: Location;
    isNew?: boolean;
    isBeta?: boolean;
    hideFavorite?: boolean;
    favoriteType?: FAVORITE_TYPE;
}

export type LNBMenu = LNBItem[]|LNBItem;

export interface BackLink {
    label: string;
    to: Location;
}

export interface TopTitle {
    icon?: string;
    label: string;
    visibleAddButton?: boolean;
    addButtonLink?: Location;
}
