import type { TranslateResult } from 'vue-i18n';


export const TAB_MENU_TYPE = {
    tab: 'tab',
    divider: 'divider',
    folder: 'folder',
} as const;

export type TabMenuType = typeof TAB_MENU_TYPE[keyof typeof TAB_MENU_TYPE];


export interface TabItem {
    name: string;
    tabType?: TabMenuType;
    label?: string | TranslateResult;
    keepAlive?: boolean;
    subItems?: TabItem[];
    icon?: string;
}
