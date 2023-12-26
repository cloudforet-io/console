import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { languages } from '@/store/modules/user/config';

// eslint-disable-next-line import/no-cycle
import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { UserState } from './type';

export const STORAGE_KEY = 'store/user';

let storedUserState: Partial<UserState> = {};

try {
    storedUserState = LocalStorageAccessor.getItem(STORAGE_KEY) ?? {};
} catch (e) {
    LocalStorageAccessor.removeItem(STORAGE_KEY);
}

const state: UserState = {
    isSessionExpired: undefined,
    userId: storedUserState.userId,
    userType: storedUserState.userType,
    roleType: storedUserState.roleType,
    authType: storedUserState.authType,
    name: storedUserState.name,
    email: storedUserState.email,
    language: (storedUserState.language && languages[storedUserState.language]) ? storedUserState.language : 'en',
    timezone: storedUserState.timezone,
    // TODO: to be deprecated
    currentRoleInfo: storedUserState.currentRoleInfo,
    requiredActions: storedUserState.requiredActions,
    emailVerified: storedUserState.emailVerified,
    isSignInLoading: false,
    mfa: storedUserState.mfa,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
