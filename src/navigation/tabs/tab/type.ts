import { TranslateResult } from 'vue-i18n';

export interface TabItem {
    name: string;
    label?: string | TranslateResult;
    keepAlive?: boolean;
}
