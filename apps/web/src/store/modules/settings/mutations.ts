import type { SettingsState } from './type';

export const initUserSettings = (state: SettingsState, item: SettingsState): void => {
    state.currencyRate = item.currencyRate;
    state.gnbNotificationLastReadTime = item.gnbNotificationLastReadTime;
};

export const setCurrencyRates = (state: SettingsState, currencyRate: SettingsState['currencyRate']): void => {
    state.currencyRate = currencyRate;
};

export const setCurrencyUpdateTime = (state: SettingsState, currencyUpdateTime: SettingsState['currencyUpdateTime']): void => {
    state.currencyUpdateTime = currencyUpdateTime;
};

export const setGnbNotificationLastReadTime = (state: SettingsState, gnbNotificationLastReadTime: SettingsState['gnbNotificationLastReadTime']): void => {
    state.gnbNotificationLastReadTime = gnbNotificationLastReadTime;
};
