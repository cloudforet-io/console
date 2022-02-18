import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';
import { DASHBOARD_PRIVACY_TYPE, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';


const state: CostDashboardState = {
    selectedTemplate: {},
    defaultFilter: {},
    selectedDashboardPrivacy: DASHBOARD_PRIVACY_TYPE.PUBLIC,
    originSelectedWidget: {} as WidgetInfo,
    editedSelectedWidget: {} as WidgetInfo,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
