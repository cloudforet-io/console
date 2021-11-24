import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { SpaceRouter } from '@/router';
import {
    isInstanceOfAPIError, isInstanceOfAuthenticationError, isInstanceOfAuthorizationError,
    isInstanceOfBadRequestError,
    isInstanceOfNotFoundError,
} from '@spaceone/console-core-lib/space-connector/error';
import { isInstanceOfNoResourceError, isInstanceOfNoSearchResourceError } from '@/common/composables/error/error';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import { TranslateResult } from 'vue-i18n';

interface GlobalErrorHandlers {
    authenticationErrorHandler: () => void;
    authorizationErrorHandler: () => void;
}

export default class ErrorHandler {
    private static authenticationErrorHandler;

    private static authorizationErrorHandler;

    static init({ authenticationErrorHandler, authorizationErrorHandler }: GlobalErrorHandlers) {
        ErrorHandler.authenticationErrorHandler = authenticationErrorHandler;
        ErrorHandler.authorizationErrorHandler = authorizationErrorHandler;
    }

    static handleError(error) {
        if (isInstanceOfAPIError(error)) {
            console.error(error);
        } else if (isInstanceOfNotFoundError(error)) {
            showErrorMessage('관리자에게 문의하세요.', error);
        } else if (isInstanceOfAuthenticationError(error)) {
            const isTokenAlive = SpaceConnector.isTokenAlive;
            if (!isTokenAlive && !SpaceRouter.router.currentRoute.meta.excludeAuth) {
                (async () => {
                    const res = await SpaceConnector.refreshAccessToken(false);
                    if (!res) ErrorHandler.authenticationErrorHandler();
                })();
            }
        } else if (isInstanceOfAuthorizationError(error)) {
            ErrorHandler.authorizationErrorHandler();
        } else if (isInstanceOfNoResourceError(error)) {
            showErrorMessage('No Resource', 'No Resource');
            SpaceRouter.router.push(error.redirectUrl);
        } else if (isInstanceOfNoSearchResourceError(error)) {
            SpaceRouter.router.push(error.redirectUrl);
        } else {
            console.error(error);
        }
    }

    static handleRequestError(error, i18nKey: TranslateResult) {
        if (isInstanceOfBadRequestError(error) && i18nKey) showErrorMessage(i18nKey, error);
        else if (isInstanceOfAPIError(error)) showErrorMessage('Something is Wrong! Please contact the administrator.', error);
        else console.error(error);
    }
}
