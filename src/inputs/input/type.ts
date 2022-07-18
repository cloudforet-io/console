import type { TranslateResult } from 'vue-i18n';

export interface SelectedItem {
    value: string;
    label: string;
    invalid?: boolean;
    invalidText?: string | TranslateResult;
    duplicated?: boolean;
}
