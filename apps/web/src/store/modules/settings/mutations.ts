import type { SettingsState } from './type';

export const initUserSettings = (state: SettingsState, item: SettingsState): void => {
    state.gnbNotificationLastReadTime = item.gnbNotificationLastReadTime;
};

export const setGnbNotificationLastReadTime = (state: SettingsState, gnbNotificationLastReadTime: SettingsState['gnbNotificationLastReadTime']): void => {
    state.gnbNotificationLastReadTime = gnbNotificationLastReadTime;
};
