import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';
import { CustomLayout, DASHBOARD_PRIVACY_TYPE, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';


const state: CostDashboardState = {
    // for creating dashboard
    selectedTemplate: {},
    defaultFilter: {},
    selectedDashboardPrivacy: DASHBOARD_PRIVACY_TYPE.PUBLIC,

    // for selecting widget
    originSelectedWidget: {} as WidgetInfo,
    editedSelectedWidget: {} as WidgetInfo,

    // for customizing dashboard
    editedCustomLayout: [] as CustomLayout[],
    widgetPosition: undefined,
    layoutOfSpace: undefined,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
