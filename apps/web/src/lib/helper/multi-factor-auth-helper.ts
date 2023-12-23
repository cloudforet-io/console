import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmMfaParams } from '@/schema/identity/user-profile/api-verbs/confirm-mfa';
import type { UserProfileDisableMfaParams } from '@/schema/identity/user-profile/api-verbs/disable-mfa';
import type { UserProfileEnableMfaParams } from '@/schema/identity/user-profile/api-verbs/enable-mfa';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserState } from '@/store/modules/user/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postEnableMfa = async (body: UserProfileEnableMfaParams): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.enableMfa<UserProfileEnableMfaParams>(body);
        await store.dispatch('user/setUser', response);
        await showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postDisableMfa = async (params: UserProfileDisableMfaParams): Promise<UserState|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.disableMfa<UserProfileDisableMfaParams>(params);
        await showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
        return response;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postValidationMfaCode = async (body: UserProfileConfirmMfaParams): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.confirmMfa<UserProfileConfirmMfaParams>(body);
        await store.dispatch('user/setUser', {
            mfa: {
                ...response.mfa,
                state: response.mfa.state,
            },
        });
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
