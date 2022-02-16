import { Mutation } from 'vuex';
import { CostDashboardCustomizeState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/store/type';

export const setOriginSelectedWidget: Mutation<CostDashboardCustomizeState> = (state, widget) => {
    state.originSelectedWidget = widget;
};

export const setEditedSelectedWidget: Mutation<CostDashboardCustomizeState> = (state, widget) => {
    state.editedSelectedWidget = widget;
};
