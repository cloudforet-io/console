import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/confirm-mfa';
import type { UserProfileEnableMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/enable-mfa';
import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import type { UserDisableMfaParameters } from '@/api-clients/identity/user/schema/api-verbs/disable-mfa';
import { i18n } from '@/translations';

import type { UserStoreState } from '@/store/user/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const postEnableMfa = async (body: UserProfileEnableMfaParameters): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.enableMfa<UserProfileEnableMfaParameters>(body);
        if (response.mfa.mfa_type === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
            showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
        }
        return response;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postUserProfileDisableMfa = async (): Promise<UserStoreState|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.disableMfa<undefined, UserStoreState>();
        if (response.mfa?.mfa_type === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
            showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
        }
        return response;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postValidationMfaCode = async (body: UserProfileConfirmMfaParameters): Promise<void|Error> => {
    try {
        const userInfo = await SpaceConnector.clientV2.identity.userProfile.confirmMfa<UserProfileConfirmMfaParameters>(body);
        let successMessage: TranslateResult;
        if (userInfo.mfa.state === 'ENABLED') {
            successMessage = i18n.t('COMMON.MFA_MODAL.ALT_S_ENABLED');
        } else {
            successMessage = i18n.t('COMMON.MFA_MODAL.ALT_S_DISABLED');
        }
        showSuccessMessage(successMessage, '');
        return userInfo;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};


export const postUserDisableMfa = async (params: UserDisableMfaParameters): Promise<UserStoreState|Error> => {
    try {
        return await SpaceConnector.clientV2.identity.user.disableMfa<UserDisableMfaParameters>(params);
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};
