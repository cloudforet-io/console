import { SpaceRouter } from '@/router';
import {
    isInstanceOfAPIError, isInstanceOfAuthorizationError,
    isInstanceOfBadRequestError,
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
        // if (isInstanceOfAuthenticationError(error)) {
        //     const isTokenAlive = SpaceConnector.isTokenAlive;
        //     if (!isTokenAlive && !SpaceRouter.router.currentRoute.meta.excludeAuth) {
        //         (async () => {
        //             console.log('handle error refresh token')
        //             const res = await SpaceConnector.refreshAccessToken(false);
        //             if (!res) ErrorHandler.authenticationErrorHandler();
        //         })();
        //     }
        // } else
        if (isInstanceOfAuthorizationError(error)) {
            ErrorHandler.authorizationErrorHandler();
            console.error(error);
        } else if (isInstanceOfNoResourceError(error)) {
            showErrorMessage('No Resource', 'No Resource');
            SpaceRouter.router.push(error.redirectUrl);
        } else if (isInstanceOfNoSearchResourceError(error)) {
            SpaceRouter.router.push(error.redirectUrl);
        } else if (isInstanceOfAPIError(error)) {
            console.error(error);
        } else {
            console.error(error);
        }
    }

    static handleRequestError(error, i18nKey: TranslateResult) {
        if (!isInstanceOfAuthorizationError(error)) {
            if (isInstanceOfBadRequestError(error) && i18nKey) showErrorMessage(i18nKey, error);
            else if (isInstanceOfAPIError(error)) showErrorMessage('Something is Wrong! Please contact the administrator.', error);
        }
        this.handleError(error);
    }
}
