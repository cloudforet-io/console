import { Mutation } from 'vuex';
import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';

export const setDashboardTemplate: Mutation<CostDashboardState> = (state, template) => {
    state.selectedTemplate = template;
};

export const setDefaultFilter: Mutation<CostDashboardState> = (state, filter) => {
    state.defaultFilter = filter;
};

export const setDashboardPrivacy: Mutation<CostDashboardState> = (state, privacy) => {
    state.selectedDashboardPrivacy = privacy;
};

export const setOriginSelectedWidget: Mutation<CostDashboardState> = (state, widget) => {
    state.originSelectedWidget = widget;
};

export const setEditedSelectedWidget: Mutation<CostDashboardState> = (state, widget) => {
    state.editedSelectedWidget = widget;
};
