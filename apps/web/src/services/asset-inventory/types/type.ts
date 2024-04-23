import type { TranslateResult } from 'vue-i18n';

export interface Period {
    start?: string;
    end?: string;
}

export interface EmptyData {
    to: { name?: string };
    buttonText?: string|TranslateResult;
    desc: string|TranslateResult;
}
