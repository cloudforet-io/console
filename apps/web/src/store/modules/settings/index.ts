import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { SettingsState } from './type';

const state: SettingsState = {
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
