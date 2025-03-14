import VueI18n from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
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
        validation.invalidText = i18n.t('IAM.USER.FORM.REQUIRED_FIELD');
    }
    return validation;
};

export const checkDuplicateID = async (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };
    const { total_count } = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>({
        user_id: userID,
    });
    if (total_count && total_count > 0) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IAM.USER.FORM.USER_ID_DUPLICATED');
    }
    return validation;
};

export const checkEmailFormat = (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '' as TranslateResult,
    };

    // RFC 5321
    if (userID.length > 320) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IAM.USER.FORM.EMAIL_INVALID');
        return validation;
    }

    const emailCheckRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailCheckRegex.test(userID)) {
        validation.isValid = false;
        validation.invalidText = i18n.t('IAM.USER.FORM.EMAIL_INVALID');
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
