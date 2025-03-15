import type { TabItem as BaseTabItem } from '@/hooks/use-tab/type';


export const TAB_MENU_TYPE = {
    tab: 'tab',
    divider: 'divider',
    folder: 'folder',
} as const;

export type TabMenuType = typeof TAB_MENU_TYPE[keyof typeof TAB_MENU_TYPE];


export type TabItem = BaseTabItem<{
    tabType?: TabMenuType;
    icon?: string;
}>;
