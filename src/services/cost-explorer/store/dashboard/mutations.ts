import type { Mutation } from 'vuex';

import type { CostDashboardState } from '@/services/cost-explorer/store/dashboard/type';

export const setDashboardTemplate: Mutation<CostDashboardState> = (state, template) => {
    state.selectedTemplate = template;
};

export const setDefaultFilter: Mutation<CostDashboardState> = (state, filter) => {
    state.defaultFilter = filter;
};

export const setIncludesFilter: Mutation<CostDashboardState> = (state, includesFilter) => {
    state.includesFilter = includesFilter;
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

export const setEditedCustomLayout: Mutation<CostDashboardState> = (state, layout) => {
    state.editedCustomLayout = layout;
};

export const setWidgetPosition: Mutation<CostDashboardState> = (state, position) => {
    state.widgetPosition = position;
};

export const setLayoutOfSpace: Mutation<CostDashboardState> = (state, layout) => {
    state.layoutOfSpace = layout;
};
