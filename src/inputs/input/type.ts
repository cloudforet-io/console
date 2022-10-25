import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@/inputs/context-menu/type';

export interface SelectedItem {
    value: string;
    label?: string;
    invalid?: boolean;
    invalidText?: string | TranslateResult;
    duplicated?: boolean;
}
export interface TextInputHandler {
    (val: string, searchableItems: MenuItem[]): Promise<{results: MenuItem[]}>|{results: MenuItem[]}
}
