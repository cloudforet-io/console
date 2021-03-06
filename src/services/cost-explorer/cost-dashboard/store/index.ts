import { CostDashboardState } from '@/services/cost-explorer/cost-dashboard/store/type';
import {
    CustomLayout,
    DASHBOARD_PRIVACY_TYPE, PublicDashboardInfo,
    UserDashboardInfo,
    WidgetInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';


const state: CostDashboardState = {
    // for creating dashboard
    selectedTemplate: {},
    defaultFilter: {},
    selectedDashboardPrivacy: DASHBOARD_PRIVACY_TYPE.USER,
    includesFilter: false,

    // for selecting widget
    originSelectedWidget: {} as WidgetInfo,
    editedSelectedWidget: {} as WidgetInfo,

    // for customizing dashboard
    editedCustomLayout: [] as CustomLayout[],
    widgetPosition: undefined,
    layoutOfSpace: undefined,

    // for dashboard
    publicDashboardList: [] as PublicDashboardInfo[],
    userDashboardList: [] as UserDashboardInfo[],
    dashboardListLoading: true,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
