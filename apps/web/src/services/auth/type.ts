import type { ComputedRef } from 'vue';
import type { TranslateResult } from 'vue-i18n';

export interface PasswordFormState {
    userIdInput: ComputedRef<string>,
    passwordInput: ComputedRef<string>,
    confirmPasswordInput: ComputedRef<string>,
}

export interface PasswordFormValidation {
    isIdValid?: boolean,
    idInvalidText: TranslateResult,
}

export interface PasswordFormExpose {
    validationState: PasswordFormValidation
}

export const PASSWORD_STATUS = {
    RESET: 'reset',
    FIND: 'find',
    INVALID: 'invalid',
} as const;
