import type { TranslateResult } from 'vue-i18n';

export interface PasswordFormValidation {
    isIdValid: undefined | boolean,
    idInvalidText: TranslateResult | string,
    isPasswordValid: undefined | boolean,
    isConfirmPasswordValid: undefined | boolean,
    confirmPasswordInvalidText: TranslateResult | string,
}

export interface PasswordFormExpose {
    validationState: PasswordFormValidation
}
