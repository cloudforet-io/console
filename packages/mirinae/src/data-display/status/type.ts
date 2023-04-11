import type { TranslateResult } from 'vue-i18n';

export interface StatusProps {
    icon?: string|null;
    text?: TranslateResult|null;
    textColor?: string|null;
    iconColor?: string|null;
    theme?: string|null;
    disableIcon?: boolean;
    iconSize?: number;
}
