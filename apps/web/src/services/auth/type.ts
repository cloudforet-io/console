import type { TranslateResult } from 'vue-i18n';

export interface PasswordFormValidation {
    isIdValid?: boolean,
    idInvalidText: TranslateResult,
    isPasswordValid?: boolean,
    isConfirmPasswordValid?: boolean,
    confirmPasswordInvalidText: TranslateResult,
}

export interface PasswordFormExpose {
    validationState: PasswordFormValidation
}

export const PasswordStatus = {
    RESET: 'reset',
    FIND: 'find',
    INVALID: 'invalid',
}as const;
