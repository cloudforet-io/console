import * as actions from './actions';
import * as mutations from './mutations';
import type { SettingsState } from './type';

const state: SettingsState = {
    gnbNotificationLastReadTime: '',
};

export default {
    namespaced: true,
    state,
    actions,
    mutations,
};
