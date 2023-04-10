import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { SettingsState } from './type';

const state: SettingsState = {
    user: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
