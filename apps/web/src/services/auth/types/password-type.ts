import type { TranslateResult } from 'vue-i18n';

interface PasswordFormValidation {
    isIdValid?: boolean,
    idInvalidText: TranslateResult,
}

export interface PasswordFormExpose {
    validationState: PasswordFormValidation
}
