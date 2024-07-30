import { reactive } from 'vue';

import { defineStore } from 'pinia';


export const useErrorStore = defineStore('error-store', () => {
    const state = reactive({
        visibleSessionExpiredError: false,
        visibleAuthorizationError: false,
        grantAccessFailStatus: false,
    });

    /* Mutation */
    const setVisibleSessionExpiredError = (val: boolean) => {
        state.visibleSessionExpiredError = val;
    };
    const setVisibleAuthorizationError = (val: boolean) => {
        state.visibleAuthorizationError = val;
    };
    const setGrantAccessFailStatus = (val: boolean) => {
        state.grantAccessFailStatus = val;
    };

    /* Action */
    const reset = () => {
        state.visibleSessionExpiredError = false;
        state.visibleAuthorizationError = false;
        state.grantAccessFailStatus = false;
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
        setGrantAccessFailStatus,
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
