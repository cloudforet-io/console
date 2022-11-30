import type { DashboardsReferenceState } from '@/store/modules/reference/dashboards/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: DashboardsReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
