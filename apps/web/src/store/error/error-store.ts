import { reactive } from 'vue';

import { defineStore } from 'pinia';


export const useErrorStore = defineStore('error-store', () => {
    const state = reactive({
        visibleSessionExpiredError: false,
        visibleAuthorizationError: false,
    });

    /* Mutation */
    const setVisibleSessionExpiredError = (val: boolean) => {
        state.visibleSessionExpiredError = val;
    };
    const setVisibleAuthorizationError = (val: boolean) => {
        state.visibleAuthorizationError = val;
    };

    /* Action */
    const reset = () => {
        state.visibleSessionExpiredError = false;
        state.visibleAuthorizationError = false;
    };
    const showSessionExpiredError = (): void => {
        state.visibleSessionExpiredError = true;
    };
    const showAuthorizationError = (): void => {
        state.visibleAuthorizationError = true;
    };

    const mutations = {
        setVisibleSessionExpiredError,
        setVisibleAuthorizationError,
    };
    const actions = {
        reset,
        showSessionExpiredError,
        showAuthorizationError,
    };
    return {
        state,
        ...mutations,
        ...actions,
    };
});
