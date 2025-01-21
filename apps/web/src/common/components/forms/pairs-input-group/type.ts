import type { TranslateResult } from 'vue-i18n';

export type PairItem = Record<string, string | number | boolean>;
export type Pair = Record<string | number, string | number | boolean>;

export type PairConfig = {
    keyLabel: string;
    valueLabel: string;
};

export type I18nLabels = {
    INVALID_KEY?: TranslateResult;
    INVALID_VALUE?: TranslateResult;
    INVALID_DUPLICATE_KEY?: TranslateResult;
    ADD_PAIR_BUTTON?: TranslateResult;
    KEY_LABEL?: TranslateResult;
    VALUE_LABEL?: TranslateResult;
};

export type ValidationData = {
    isValid: boolean;
    message: string | TranslateResult;
};
