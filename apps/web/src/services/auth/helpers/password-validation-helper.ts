import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

interface ValidationInfo {
    isValid: boolean;
    invalidText: string | TranslateResult;
}

export const getPasswordValidationInfo = (password): ValidationInfo => {
    const result: ValidationInfo = { isValid: true, invalidText: '' };

    if (password.replace(/ /g, '').length !== password.length) {
        result.isValid = false;
        result.invalidText = i18n.t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
    } else if (password.length < 8) {
        result.isValid = false;
        result.invalidText = i18n.t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 8 });
    } else if (!password.match(/[a-z]/)) {
        result.isValid = false;
        result.invalidText = i18n.t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
    } else if (!password.match(/[A-Z]/)) {
        result.isValid = false;
        result.invalidText = i18n.t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
    } else if (!password.match(/[0-9]/)) {
        result.isValid = false;
        result.invalidText = i18n.t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
    }
    return result;
};

