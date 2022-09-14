import type { TranslateResult } from 'vue-i18n';

export interface TagItem {
    key: string | number;
    value: string | number | boolean;
}

export interface Tag {
    [key: string | number]: string | number | boolean;
}

export type ValidationData = {
    isValid: boolean;
    message: string | TranslateResult;
};
