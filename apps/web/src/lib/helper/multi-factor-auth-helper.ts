import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmMfaParameters } from '@/schema/identity/user-profile/api-verbs/confirm-mfa';
import type { UserProfileEnableMfaParameters } from '@/schema/identity/user-profile/api-verbs/enable-mfa';
import { MULTI_FACTOR_AUTH_TYPE } from '@/schema/identity/user-profile/constant';
import type { UserDisableMfaParameters } from '@/schema/identity/user/api-verbs/disable-mfa';
import { i18n } from '@/translations';

import { pinia } from '@/store/pinia';
import type { UserState } from '@/store/user/type';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postEnableMfa = async (body: UserProfileEnableMfaParameters, setUser?: boolean): Promise<void|Error> => {
    const userStore = useUserStore(pinia);
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.enableMfa<UserProfileEnableMfaParameters>(body);
        if (setUser) {
            await userStore.setUser(response);
        }
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

export const postUserProfileDisableMfa = async (): Promise<UserState|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.disableMfa<undefined, UserState>();
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


export const postUserDisableMfa = async (params: UserDisableMfaParameters): Promise<UserState|Error> => {
    try {
        return await SpaceConnector.clientV2.identity.user.disableMfa<UserDisableMfaParameters>(params);
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};
