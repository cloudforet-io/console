import Vue from 'vue';

import { useErrorStore } from '@/store/error/error-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const initErrorHandler = () => {
    Vue.config.errorHandler = (error) => ErrorHandler.handleError(error);
    const errorStore = useErrorStore(pinia);
    const userStore = useUserStore(pinia);
    ErrorHandler.init({
        authenticationErrorHandler: () => {
            errorStore.showSessionExpiredError();
            userStore.setIsSessionExpired(true);
        },
        authorizationErrorHandler: () => {
            errorStore.showAuthorizationError();
        },
    });
};
