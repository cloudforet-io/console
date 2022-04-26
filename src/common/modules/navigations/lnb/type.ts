import { Location } from 'vue-router';
import { MenuIdType } from '@/lib/menu/config';

export const MENU_ITEM_TYPE = Object.freeze({
    TITLE: 'title',
    ITEM: 'item',
    DIVIDER: 'divider',
} as const);
type MenuItemType = typeof MENU_ITEM_TYPE[keyof typeof MENU_ITEM_TYPE];

export interface LNBItem {
    type: MenuItemType;
    label?: string;
    id?: MenuIdType;
    foldable?: boolean;
    to?: Location;
    isNew?: boolean;
    isBeta?: boolean;
    hideFavorite?: boolean;
    isSecondDepth?: boolean;
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
