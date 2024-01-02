import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmEmailParameters } from '@/schema/identity/user-profile/api-verbs/confirm-email';
import type { UserProfileVerifyEmailParameters } from '@/schema/identity/user-profile/api-verbs/verify-email';
import type { UserVerifyEmailParameters } from '@/schema/identity/user/api-verbs/verify-email';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postUserProfileValidationEmail = async (params: UserProfileVerifyEmailParameters): Promise<void|Error> => {
    try {
        await SpaceConnector.clientV2.identity.userProfile.verifyEmail<UserProfileVerifyEmailParameters>(params);
        showSuccessMessage(i18n.t('COMMON.NOTIFICATION_MODAL.SUCCESS'), '');
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
        throw e;
    }
};

export const postValidationCode = async (params: UserProfileConfirmEmailParameters): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.confirmEmail<UserProfileConfirmEmailParameters>(params);
        await store.dispatch('user/setUser', { email: response.email, email_verified: response.email_verified });
        showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION_EMAIL.SUCCESS'), '');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
        throw e;
    }
};

export const postUserValidationEmail = async (params: UserVerifyEmailParameters): Promise<void|Error> => {
    try {
        await SpaceConnector.clientV2.identity.user.verifyEmail<UserVerifyEmailParameters>(params);
        showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION_EMAIL.SUCCESS'), '');
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
        throw e;
    }
};
