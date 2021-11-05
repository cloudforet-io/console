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
    static handleError(error) {
        switch (error) {
        case isInstanceOfAPIError(error):
            console.error(error);
            break;

        case isInstanceOfNotFoundError(error):
            showErrorMessage('관리자에게 문의하세요.', error);
            break;

        case isInstanceOfBadRequestError(error):
            showErrorMessage('Bad Request Error', error);
            break;

        case isInstanceOfAuthenticationError(error):
            {
                const isTokenAlive = SpaceConnector.isTokenAlive;
                if (!isTokenAlive && !SpaceRouter.router.currentRoute.meta.excludeAuth) {
                    (async () => {
                        const res = await SpaceConnector.refreshAccessToken(false);
                        if (!res) store.dispatch('error/showSessionExpiredError');
                    })();
                }
            }
            break;

        case isInstanceOfAuthorizationError(error):
            store.dispatch('error/showAuthorizationError');
            break;

        case isInstanceOfNoResourceError(error):
            showErrorMessage('No Resource', 'No Resource');
            SpaceRouter.router.push(error.redirectUrl);
            break;

        case isInstanceOfNoSearchResourceError(error):
            SpaceRouter.router.push(error.redirectUrl);
            break;

        default:
            console.error(error);
            break;
        }
    }
}
