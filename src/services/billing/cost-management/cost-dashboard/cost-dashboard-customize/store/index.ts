import { CostDashboardCustomizeState } from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/store/type';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';

const state: CostDashboardCustomizeState = {
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
