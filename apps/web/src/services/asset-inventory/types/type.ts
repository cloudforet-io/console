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

// NOTE: This is a temporary interface. It will be replaced with the actual interface.
export interface AdditionalRule {
    order: number;
    tag?: {
        key?: string;
        value?: string;
    };
    project_routing?: string;
    stop_processing?: boolean;
}
