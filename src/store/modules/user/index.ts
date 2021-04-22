import { UserState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

export const STORAGE_KEY = 'store/user';

let storedUserState: UserState = {};

try {
    storedUserState = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
} catch (e) {
    window.localStorage.removeItem(STORAGE_KEY);
}

const state: UserState = {
    isSessionExpired: undefined,
    userId: storedUserState.userId,
    userType: storedUserState.userType,
    backend: storedUserState.backend,
    name: storedUserState.name,
    email: storedUserState.email,
    language: storedUserState.language,
    timezone: storedUserState.timezone,
    roles: storedUserState.roles,
    reportState: storedUserState.reportState,
    powerSchedulerState: storedUserState.powerSchedulerState,
    spotAutomationState: storedUserState.spotAutomationState,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
