import type { Mutation } from 'vuex';

import { setI18nLocale } from '@/translations';

import type { UserState, RoleInfo, GrantInfo } from './type';

export const setUser = async (state: UserState, userInfo: UserState): Promise<void> => {
    state.userId = userInfo.userId;
    state.authType = userInfo.authType;
    state.roleType = userInfo.roleType;
    state.name = userInfo.name;
    state.email = userInfo.email;
    state.language = userInfo.language;
    state.timezone = userInfo.timezone;
    state.requiredActions = userInfo.requiredActions;
    state.emailVerified = userInfo.emailVerified;
    state.mfa = userInfo.mfa;

    if (userInfo.language) {
        await setI18nLocale(userInfo.language);
    }
};

export const setIsSessionExpired = (state: UserState, isSessionExpired?: boolean): void => {
    state.isSessionExpired = isSessionExpired;
};

export const setLanguage = (state: UserState, language: string): void => {
    state.language = language;
};

export const setTimezone = (state: UserState, timezone: string): void => {
    state.timezone = timezone;
};

export const setCurrentGrantInfo = (state: UserState, currentGrantInfo: GrantInfo): void => {
    state.currentGrantInfo = currentGrantInfo;
};
export const setCurrentRoleInfo = (state: UserState, currentRoleInfo?: RoleInfo): void => {
    state.currentRoleInfo = currentRoleInfo;
};
export const setIsSignInLoading: Mutation<UserState> = (state, isSignInLoading: boolean): void => {
    state.isSignInLoading = isSignInLoading;
};

