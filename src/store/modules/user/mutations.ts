import { UserState, UserRole } from './type';

export const setUser = (state: UserState, userInfo: UserState): void => {
    state.userId = userInfo.userId;
    state.userType = userInfo.userType;
    state.backend = userInfo.backend;
    state.name = userInfo.name;
    state.email = userInfo.email;
    state.language = userInfo.language;
    state.timezone = userInfo.timezone;
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

export const setRoles = (state: UserState, roles: Array<UserRole>): void => {
    state.roles = roles;
};

export const setPowerSchedulerState = (state: UserState, powerSchedulerState: boolean): void => {
    state.powerSchedulerState = powerSchedulerState;
};

export const setSpotAutomationState = (state: UserState, spotAutomationState: boolean): void => {
    state.spotAutomationState = spotAutomationState;
};
