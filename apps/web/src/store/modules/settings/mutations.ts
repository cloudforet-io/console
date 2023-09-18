import { CURRENCY } from '@/store/modules/settings/config';

import type { SettingsState } from './type';

export const initUserSettings = (state: SettingsState, item: SettingsState): void => {
    state.currency = CURRENCY.USD;
    state.currencyUpdateTime = item.currencyUpdateTime;
    state.gnbNotificationLastReadTime = item.gnbNotificationLastReadTime;
};

export const setGnbNotificationLastReadTime = (state: SettingsState, gnbNotificationLastReadTime: SettingsState['gnbNotificationLastReadTime']): void => {
    state.gnbNotificationLastReadTime = gnbNotificationLastReadTime;
};
