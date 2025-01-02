import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

export interface DataSelectorItem extends MenuItem {
    name: string;
    label: string;
}
