import type { AlertState } from '@/services/alert-manager/store/alert/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: AlertState = {
    alertData: null,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
