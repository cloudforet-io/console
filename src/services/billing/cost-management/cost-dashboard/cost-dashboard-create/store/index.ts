import { CostDashboardCreateState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';

const state: CostDashboardCreateState = {
    selectedTemplate: {},
    defaultFilter: {},
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
