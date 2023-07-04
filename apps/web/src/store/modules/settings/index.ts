import { DEFAULT_CURRENCY_RATES } from '@/store/modules/settings/config';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { SettingsState } from './type';

const state: SettingsState = {
    currencyRates: DEFAULT_CURRENCY_RATES,
    currencyUpdateTime: undefined,
    currency: 'USD',
    gnbNotificationLastReadTime: '',
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
