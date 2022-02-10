import { CostDashboardCreateState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store/type';
import { DASHBOARD_PRIVACY_TYPE } from '@/services/billing/cost-management/cost-dashboard/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';

const state: CostDashboardCreateState = {
    selectedTemplate: {},
    defaultFilter: {},
    selectedDashboardPrivacy: DASHBOARD_PRIVACY_TYPE.PUBLIC,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
