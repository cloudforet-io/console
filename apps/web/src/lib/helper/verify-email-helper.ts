import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postValidationEmail = async (body, resend): Promise<void|Error> => {
    const { email, user_id, domain_id } = body;
    try {
        console.log(resend);
        await SpaceConnector.clientV2.identity.user.verifyEmail({
            user_id,
            email,
            domain_id,
        });
        if (resend !== true) {
            await store.dispatch('user/setUser', { emailVerified: false, email });
        } else {
            await store.dispatch('user/setUser', { email });
        }
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postValidationCode = async (body): Promise<void|Error> => {
    const { user_id, code, domain_id } = body;
    try {
        const response = await SpaceConnector.clientV2.identity.user.confirmEmail({
            user_id,
            verify_code: code,
            domain_id,
        });
        await store.dispatch('user/setUser', { emailVerified: response.email_verified, email: response.email });
        // TODO: babel edit
        showSuccessMessage('success!!!!!', '');
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
