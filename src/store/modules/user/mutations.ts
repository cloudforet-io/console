import { UserState } from './type';

export const setUser = (state: UserState, userInfo: UserState): void => {
    state.userId = userInfo.userId;
    state.userType = userInfo.userType;
    state.backend = userInfo.backend;
    state.name = userInfo.name;
    state.email = userInfo.email;
    state.language = userInfo.language;
    state.timezone = userInfo.timezone;
};

export const expireSession = (state: UserState): void => {
    state.isSessionExpired = true;
};

export const setLanguage = (state: UserState, language: string): void => {
    state.language = language;
};

export const setTimezone = (state: UserState, timezone: string): void => {
    state.timezone = timezone;
};

export const setReportState = (state: UserState, reportState: boolean): void => {
    state.reportState = reportState;
};

export const setPowerSchedulerState = (state: UserState, powerSchedulerState: boolean): void => {
    state.powerSchedulerState = powerSchedulerState;
};
