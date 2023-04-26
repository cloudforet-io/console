import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postValidationEmail = async (body): Promise<void|Error> => {
    const { email, user_id, domain_id } = body;
    try {
        await SpaceConnector.clientV2.identity.user.verifyEmail({
            user_id,
            email,
            domain_id,
        });
        return undefined;
    } catch (e: any) {
        showErrorMessage(e.axiosError.response.data.detail.message, e);
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
            await store.dispatch('user/setUser', { emailVerified: response.email_verified, email: response.email });
        }
        showSuccessMessage(i18n.t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.SUCCESS'), '');
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
