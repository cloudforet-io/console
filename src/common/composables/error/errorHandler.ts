import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { SpaceRouter } from '@/router';
import { store } from '@/store';

import {
    isInstanceOfAPIError, isInstanceOfAuthenticationError, isInstanceOfAuthorizationError,
    isInstanceOfBadRequestError,
    isInstanceOfNotFoundError,
} from '@spaceone/console-core-lib/space-connector/error';
import { isInstanceOfNoResourceError, isInstanceOfNoSearchResourceError } from '@/common/composables/error/error';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';


export default class ErrorHandler {
    static async handleError(error) {
        if (isInstanceOfAPIError(error)) {
            console.error(error);
        }

        if (isInstanceOfNotFoundError(error)) {
            showErrorMessage('관리자에게 문의하세요.', error, '');
        }

        if (isInstanceOfBadRequestError(error)) {
            showErrorMessage('Bad Request Error', error, '');
        }

        if (isInstanceOfAuthenticationError(error)) {
            const isTokenAlive = SpaceConnector.isTokenAlive;
            if (!isTokenAlive && !SpaceRouter.router.currentRoute.meta.excludeAuth) {
                const res = await SpaceConnector.refreshAccessToken(false);
                if (!res) await store.dispatch('error/showSessionExpiredError');
            }
        }

        if (isInstanceOfAuthorizationError(error)) {
            await store.dispatch('error/showAuthorizationError');
        }

        if (isInstanceOfNoResourceError(error)) {
            showErrorMessage('No Resource', 'No Resource', '');
            await SpaceRouter.router.push(error.redirectUrl);
        }

        if (isInstanceOfNoSearchResourceError(error)) {
            await SpaceRouter.router.push(error.redirectUrl);
        }
    }
}
