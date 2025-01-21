import type { TranslateResult } from 'vue-i18n';

export type PairType = 'TAGS' | 'MESSAGE_FORMAT';

export type PairItem = Record<string, string | number | boolean>;
export type Pair = Record<string | number, string | number | boolean>;

export type ValidationData = {
    isValid: boolean;
    message: string | TranslateResult;
};
