import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

export interface Validation {
	isValid: boolean;
	invalidText: string;
}

export const checkRequiredField = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '',
    };
    if (!valueForCheck || valueForCheck?.length === 0) {
        validation.isValid = false;
        validation.invalidText = i18n.global.t('IDENTITY.USER.FORM.REQUIRED_FIELD');
    }
    return validation;
};

export const checkDuplicateID = async (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '',
    };
    const { total_count } = await SpaceConnector.client.identity.user.list({ user_id: userID });
    if (total_count > 0) {
        validation.isValid = false;
        validation.invalidText = i18n.global.t('IDENTITY.USER.FORM.USER_ID_DUPLICATED');
    }
    return validation;
};

export const checkOauth = async (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '',
    };
    try {
        await SpaceConnector.client.identity.user.find({
            search: { user_id: userID },
            domain_id: store.state['domain/domainId'],
        });
    } catch (e) {
        validation.isValid = false;
        validation.invalidText = i18n.global.t('IDENTITY.USER.FORM.USER_ID_NOT_EXIST');
    }
    return validation;
};

export const checkEmailFormat = (userID: string) => {
    const validation = {
        isValid: true,
        invalidText: '',
    };
    const emailCheckRegex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (!emailCheckRegex.test(userID)) {
        validation.isValid = false;
        validation.invalidText = i18n.global.t('IDENTITY.USER.FORM.EMAIL_INVALID');
    }
    return validation;
};

export const checkEmptyValue = async (valueForCheck: string) => {
    const validation = {
        isValid: true,
        invalidText: '',
    };
    if (valueForCheck.replace(/ /g, '').length !== valueForCheck.length) {
        validation.isValid = false;
        validation.invalidText = i18n.global.t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
    }
    return validation;
};
