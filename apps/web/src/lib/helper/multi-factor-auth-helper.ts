import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmMfaParameters } from '@/schema/identity/user-profile/api-verbs/confirm-mfa';
import type { UserProfileEnableMfaParameters } from '@/schema/identity/user-profile/api-verbs/enable-mfa';
import type { UserDisableMfaParameters } from '@/schema/identity/user/api-verbs/disable-mfa';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserState } from '@/store/modules/user/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postEnableMfa = async (body: UserProfileEnableMfaParameters, setUser?: boolean): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.enableMfa<UserProfileEnableMfaParameters>(body);
        if (setUser) {
            await store.dispatch('user/setUser', response);
        }
        showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
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
        showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
        return response;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postValidationMfaCode = async (body: UserProfileConfirmMfaParameters): Promise<void|Error> => {
    try {
        return SpaceConnector.clientV2.identity.userProfile.confirmMfa<UserProfileConfirmMfaParameters>(body);
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
