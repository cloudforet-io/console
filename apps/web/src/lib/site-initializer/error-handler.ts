import Vue from 'vue';

import { useErrorStore } from '@/store/error/error-store';
import { pinia } from '@/store/pinia';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const initErrorHandler = (store) => {
    Vue.config.errorHandler = (error) => ErrorHandler.handleError(error);
    const errorStore = useErrorStore(pinia);
    ErrorHandler.init({
        authenticationErrorHandler: () => {
            errorStore.showSessionExpiredError();
            store.dispatch('user/setIsSessionExpired', true);
        },
        authorizationErrorHandler: () => {
            errorStore.showAuthorizationError();
        },
    });
};
