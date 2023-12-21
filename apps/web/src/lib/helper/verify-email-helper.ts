import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserVerifyEmailParameters } from '@/schema/identity/user/api-verbs/verify-email';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postValidationEmail = async (params: UserVerifyEmailParameters): Promise<void|Error> => {
    try {
        await SpaceConnector.clientV2.identity.user.verifyEmail<UserVerifyEmailParameters>(params);
        await showSuccessMessage(i18n.t('COMMON.NOTIFICATION_MODAL.SUCCESS'), '');
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
        throw e;
    }
};

export const postValidationCode = async (body, setUser): Promise<void|Error> => {
    const { user_id, code, domain_id } = body;
    try {
        const response = await SpaceConnector.clientV2.identity.user.confirmEmail({
            user_id,
            verify_code: code,
            domain_id,
        });
        if (setUser) {
            await store.dispatch('user/setUser', { email: response.email, email_verified: response.email_verified });
        }
        showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION_EMAIL.SUCCESS'), '');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
        throw e;
    }
};
