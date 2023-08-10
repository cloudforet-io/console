import { CURRENCY } from '@/store/modules/settings/config';

import type { SettingsState } from './type';

export const initUserSettings = (state: SettingsState, item: SettingsState): void => {
    state.currencyRates = item.currencyRates;
    state.currency = item.currency ?? CURRENCY.USD;
    state.currencyUpdateTime = item.currencyUpdateTime;
    state.gnbNotificationLastReadTime = item.gnbNotificationLastReadTime;
};

export const setCurrencyRates = (state: SettingsState, currencyRates: SettingsState['currencyRates']): void => {
    state.currencyRates = currencyRates;
};

export const setCurrency = (state: SettingsState, currency: SettingsState['currency']): void => {
    state.currency = currency;
};

export const setCurrencyUpdateTime = (state: SettingsState, currencyUpdateTime: SettingsState['currencyUpdateTime']): void => {
    state.currencyUpdateTime = currencyUpdateTime;
};

export const setGnbNotificationLastReadTime = (state: SettingsState, gnbNotificationLastReadTime: SettingsState['gnbNotificationLastReadTime']): void => {
    state.gnbNotificationLastReadTime = gnbNotificationLastReadTime;
};
