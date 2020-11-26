import { TranslateResult } from 'vue-i18n';

export interface TagItem {
    key: string | number;
    value: string | number | boolean;
}

export type ValidationData = {
    isValid: boolean;
    message: string | TranslateResult;
}
export interface TagValidation {
    key: ValidationData;
    value: ValidationData;
}

export interface TagsInputGroupProps {
    tags: object;
    disabled: boolean;
    isValid: boolean;
    showEmptyInput: boolean;
    showValidation: boolean;
    showHeader: boolean;
    focused: boolean;
}
