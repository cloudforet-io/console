import { UserState } from './type';

export const setUser = (state: UserState, userInfo: UserState): void => {
    state.userId = userInfo.userId;
    state.userType = userInfo.userType;
    state.language = userInfo.language;
    state.timezone = userInfo.timezone;
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
