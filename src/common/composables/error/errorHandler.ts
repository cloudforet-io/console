import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    isInstanceOfAPIError, isInstanceOfAuthenticationError, isInstanceOfAuthorizationError,
    isInstanceOfBadRequestError,
} from '@cloudforet/core-lib/space-connector/error';

import { SpaceRouter } from '@/router';

import { getRouteAccessLevel } from '@/lib/access-control';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { isInstanceOfNoResourceError, isInstanceOfNoSearchResourceError } from '@/common/composables/error/error';

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
        if (isInstanceOfAuthenticationError(error)) {
            const isTokenAlive = SpaceConnector.isTokenAlive;

            if (!isTokenAlive
                && getRouteAccessLevel(SpaceRouter.router.currentRoute) >= ACCESS_LEVEL.AUTHENTICATED) {
                ErrorHandler.authenticationErrorHandler();
            }
        } else if (isInstanceOfAuthorizationError(error)) {
            ErrorHandler.authorizationErrorHandler();
            console.error(error);
        } else if (isInstanceOfNoResourceError(error)) {
            showErrorMessage('No Resource', 'No Resource');
            SpaceRouter.router.push(error.redirectUrl);
        } else if (isInstanceOfNoSearchResourceError(error)) {
            SpaceRouter.router.push(error.redirectUrl);
        } else if (isInstanceOfAPIError(error)) {
            console.error('API Error', error);
        } else {
            console.error(error);
        }
    }

    static handleRequestError(error: unknown, errorMessage: TranslateResult) {
        if (!isInstanceOfAuthorizationError(error)) {
            if (isInstanceOfBadRequestError(error) && errorMessage) showErrorMessage(errorMessage, error);
            else if (isInstanceOfAPIError(error)) showErrorMessage('Something is Wrong! Please contact the administrator.', error);
        }
        this.handleError(error);
    }

    static handleToastUIError(error: unknown, errorTitle: TranslateResult|string, errorDescription?: TranslateResult|string) {
        if (errorTitle) showErrorMessage(errorTitle, errorDescription);
        this.handleError(error);
    }
}
