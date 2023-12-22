import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileDisableMfaParams } from '@/schema/identity/user-profile/api-verbs/disable-mfa';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserState } from '@/store/modules/user/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postEnableMfa = async (body): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.user.enableMfa(body);
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
        const response = await SpaceConnector.clientV2.identity.user.disableMfa<UserProfileDisableMfaParams>(params);
        await showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_SENT_EMAIL'), '');
        return response;
    } catch (e: any) {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postValidationMfaCode = async (body): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.user.confirmMfa(body);
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
