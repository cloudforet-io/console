import { TranslateResult } from 'vue-i18n';

export interface TabItem {
    name: string;
    label?: string | TranslateResult;
    keepAlive?: boolean;
}

type TabsType = Array<string|TabItem>;

interface TabStateType {
    tabs: TabsType;
}
interface TabSyncType {
    activeTab: string;
}

export interface TabProps extends TabStateType, TabSyncType {}
