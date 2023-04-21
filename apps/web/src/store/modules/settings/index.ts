import { DEFAULT_CURRENCY_RATES } from '@/store/modules/settings/config';

import * as actions from './actions';
import * as mutations from './mutations';
import type { SettingsState } from './type';

export const STORAGE_KEY = 'store/settings';

const state: SettingsState = {
    currencyRate: DEFAULT_CURRENCY_RATES,
    currencyUpdateTime: undefined,
    gnbNotificationLastReadTime: '',
};

export default {
    namespaced: true,
    state,
    actions,
    mutations,
};
