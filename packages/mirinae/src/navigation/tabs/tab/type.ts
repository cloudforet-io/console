import type { TranslateResult } from 'vue-i18n';


export const TAB_MENU_TYPE = {
    tab: 'tab',
    divider: 'divider',
    folder: 'folder',
} as const;

export type TabMenuType = typeof TAB_MENU_TYPE[keyof typeof TAB_MENU_TYPE];


export interface TabItem {
    name: string;
    type?: TabMenuType;
    label?: string | TranslateResult;
    keepAlive?: boolean;
    subItems?: Array<TabItem>;
    icon?: string;
}

export interface TabProps {
    activeTab: string;
    tabs: Array<string|TabItem>;
    stretch?: boolean;
}
