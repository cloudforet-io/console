import { Mutation } from 'vuex';
import { CostDashboardCreateState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/store/type';

export const setDashboardTemplate: Mutation<CostDashboardCreateState> = (state, template) => {
    state.selectedTemplate = template;
};

export const setDefaultFilter: Mutation<CostDashboardCreateState> = (state, filter) => {
    state.defaultFilter = filter;
};
