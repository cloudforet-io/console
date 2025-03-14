import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmEmailParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/confirm-email';
import type { UserProfileVerifyEmailParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/verify-email';
import type { UserVerifyEmailParameters } from '@/api-clients/identity/user/schema/api-verbs/verify-email';
import { i18n } from '@/translations';

import type { useUserStore } from '@/store/user/user-store';

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

export const postValidationCode = async (params: UserProfileConfirmEmailParameters, userStore: ReturnType<typeof useUserStore>): Promise<void|Error> => {
    try {
        const response = await SpaceConnector.clientV2.identity.userProfile.confirmEmail<UserProfileConfirmEmailParameters>(params);
        await userStore.updateUser({
            email: response.email,
        });
        userStore.setEmailVerified(response.email_verified);
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
