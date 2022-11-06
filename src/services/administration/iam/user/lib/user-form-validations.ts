import VueI18n from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import TranslateResult = VueI18n.TranslateResult;

export interface Validation {
	isValid: boolean;
	invalidText: TranslateResult;
}

export const checkRequiredField = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (!valueForCheck || valueForCheck?.length === 0) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.REQUIRED_FIELD');
    }
    return validation;
};

export const checkDuplicateID = async (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    const { total_count } = await SpaceConnector.client.identity.user.list({ user_id: userID });
    if (total_count > 0) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.USER_ID_DUPLICATED');
    }
    return validation;
};

export const checkOauth = async (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    try {
        await SpaceConnector.client.identity.user.find({
            search: { user_id: userID },
            domain_id: store.state.domain.domainId,
        });
    } catch (e) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.USER_ID_NOT_EXIST');
    }
    return validation;
};

export const checkEmailFormat = (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (!emailCheckRegex.test(userID)) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID');
    }
    return validation;
};

export const checkEmptyValue = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (valueForCheck.replace(/ /g, '').length !== valueForCheck.length) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
    }
    return validation;
};

export const checkMinLength = async (valueForCheck: string, minLength: number) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (valueForCheck.length < minLength) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: minLength });
    }
    return validation;
};

export const checkOneLowerCase = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (!valueForCheck.match(/[a-z]/)) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
    }
    return validation;
};

export const checkOneUpperCase = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (!valueForCheck.match(/[A-Z]/)) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
    }
    return validation;
};

export const checkOneNumber = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (!valueForCheck.match(/[0-9]/)) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
    }
    return validation;
};

export const checkSamePassword = async (originPasswordForCheck: string, newPasswordForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    if (newPasswordForCheck !== originPasswordForCheck) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
    }
    return validation;
};
