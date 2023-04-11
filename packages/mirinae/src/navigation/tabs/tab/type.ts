import type { TranslateResult } from 'vue-i18n';

export interface TabItem {
    name: string;
    label?: string | TranslateResult;
    keepAlive?: boolean;
}

export interface TabProps {
    activeTab: string;
    tabs: Array<string|TabItem>;
    stretch?: boolean;
}
