import { Location } from 'vue-router';
import { MenuIdType } from '@/lib/router/type';

export const MENU_ITEM_TYPE = ['title', 'item', 'divider'];
type MenuItemType = typeof MENU_ITEM_TYPE[number]

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

export type LNBItemList = LNBItem[];

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
