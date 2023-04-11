import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import type { UpdateUserRequest } from '@/store/modules/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const postValidationEmail = async (body): Promise<void|Error> => {
    const { email, userId, domainId } = body;
    try {
        const userParam: UpdateUserRequest = { email };
        await store.dispatch('user/setUser', userParam);
        await SpaceConnector.clientV2.identity.user.verifyEmail({
            user_id: userId,
            email,
            domain_id: domainId,
        });
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const postValidationCode = async (body): Promise<void|Error> => {
    const { userId, code, domainId } = body;
    try {
        const response = await SpaceConnector.clientV2.identity.user.confirmEmail({
            user_id: userId,
            verify_code: code,
            domain_id: domainId,
        });
        await store.dispatch('user/setUser', { emailVerified: response.email_verified, email: response.email });
        // TODO: babel edit
        showSuccessMessage('success!!!!!', '');
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
