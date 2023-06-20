import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router/types/router';

import { i18n } from '@/translations';

import { MENU_ID } from '@/lib/menu/config';

interface ValidationInfo {
    isValid: boolean;
    invalidText: string | TranslateResult;
}

export const getPasswordValidationInfo = (password): ValidationInfo => {
    const result: ValidationInfo = { isValid: true, invalidText: '' };

    if (password.replace(/ /g, '').length !== password.length) {
        result.isValid = false;
        result.invalidText = i18n.global.t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
    } else if (password.length < 8) {
        result.isValid = false;
        result.invalidText = i18n.global.t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 8 });
    } else if (!password.match(/[a-z]/)) {
        result.isValid = false;
        result.invalidText = i18n.global.t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
    } else if (!password.match(/[A-Z]/)) {
        result.isValid = false;
        result.invalidText = i18n.global.t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
    } else if (!password.match(/[0-9]/)) {
        result.isValid = false;
        result.invalidText = i18n.global.t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
    }
    return result;
};

export const GENERAL_USER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.HOME_DASHBOARD,
});

export const NO_ROLE_USER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.MY_PAGE_ACCOUNT,
});

export const DOMAIN_OWNER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.ADMINISTRATION_USER,
});

export const getDefaultRouteAfterSignIn = (isDomainOwner: boolean, hasSystemRole: boolean, hasAnyPermissions: boolean): Location => {
    if (isDomainOwner || hasSystemRole) return DOMAIN_OWNER_DEFAULT_ROUTE;
    if (hasAnyPermissions) return GENERAL_USER_DEFAULT_ROUTE;
    return NO_ROLE_USER_DEFAULT_ROUTE;
};
