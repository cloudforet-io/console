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
    userId: storedUserState.userId,
    userType: storedUserState.userType,
    language: storedUserState.language,
    timezone: storedUserState.timezone,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
