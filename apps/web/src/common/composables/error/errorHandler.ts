import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    isInstanceOfAPIError, isInstanceOfAuthenticationError, isInstanceOfAuthorizationError,
    isInstanceOfBadRequestError,
} from '@cloudforet/core-lib/space-connector/error';

import { SpaceRouter } from '@/router';

import { getRouteScope } from '@/router/helpers/route-helper';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { isInstanceOfNoResourceError, isInstanceOfNoSearchResourceError } from '@/common/composables/error/error';

interface GlobalErrorHandlers {
    authenticationErrorHandler: () => void;
    authorizationErrorHandler: () => void;
}

export interface APIErrorToast {
    (errorTitle?:string|TranslateResult): void
}

export default class ErrorHandler {
    private static authenticationErrorHandler;

    private static authorizationErrorHandler;

    static init({ authenticationErrorHandler, authorizationErrorHandler }: GlobalErrorHandlers) {
        ErrorHandler.authenticationErrorHandler = authenticationErrorHandler;
        ErrorHandler.authorizationErrorHandler = authorizationErrorHandler;
    }

    static handleError(error: unknown, toast = false) {
        if (isInstanceOfAuthenticationError(error)) {
            const isTokenAlive = SpaceConnector.isTokenAlive;

            if (!isTokenAlive
                && getRouteScope(SpaceRouter.router.currentRoute) !== 'EXCLUDE_AUTH') {
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
            if (toast) showErrorMessage(error.code, error.message);
            console.error('API Error', error);
        } else {
            console.error(error);
        }
    }

    static makeAPIErrorToast(error: unknown): APIErrorToast {
        if (isInstanceOfAPIError(error)) {
            return (errorTitle?:string|TranslateResult) => {
                showErrorMessage(errorTitle ?? error.code, error.message);
            };
        }
        return () => {
            console.error('Failed to make API error toast');
        };
    }

    static handleRequestError(error: unknown, errorMessage: TranslateResult, toast = false) {
        if (!isInstanceOfAuthorizationError(error)) {
            if (isInstanceOfBadRequestError(error) && errorMessage) {
                showErrorMessage(errorMessage, error);
                this.handleError(error);
                return;
            }
            if (isInstanceOfAPIError(error)) {
                showErrorMessage('Something is Wrong! Please contact the administrator.', error);
                this.handleError(error);
                return;
            }
        }
        if (toast) showErrorMessage('Something is Wrong! Please contact the administrator.', error);
        this.handleError(error);
    }
}
