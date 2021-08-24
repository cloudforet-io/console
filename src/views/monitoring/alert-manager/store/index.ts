import { AlertStoreState } from '@/views/monitoring/alert-manager/store/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: AlertStoreState = {
    alertData: null,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
