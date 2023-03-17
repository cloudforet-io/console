import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type {
    CustomLayout, DashboardPrivacyType, DefaultLayout, PublicDashboardInfo, WidgetInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import { DASHBOARD_PRIVACY_TYPE } from '@/services/cost-explorer/cost-dashboard/type';
import type { CostFiltersMap } from '@/services/cost-explorer/type';


interface CostDashboardState {
    selectedTemplate: Record<string, DefaultLayout> | PublicDashboardInfo;
    defaultFilter: CostFiltersMap;
    includesFilter: boolean;
    selectedDashboardPrivacy: DashboardPrivacyType;
    //
    originSelectedWidget?: WidgetInfo;
    editedSelectedWidget?: WidgetInfo;
    //
    editedCustomLayout?: CustomLayout[];
    widgetPosition?: { row?: number; col?: number };
    layoutOfSpace?: number;
}

export const useCostDashboardPageStore = defineStore('cost-dashboard-page', () => {
    const state = reactive<CostDashboardState>({
        // for creating dashboard
        selectedTemplate: {},
        defaultFilter: {},
        selectedDashboardPrivacy: DASHBOARD_PRIVACY_TYPE.USER,
        includesFilter: false,

        // for selecting widget
        originSelectedWidget: undefined as undefined|WidgetInfo,
        editedSelectedWidget: undefined as undefined|WidgetInfo,

        // for customizing dashboard
        editedCustomLayout: [] as CustomLayout[],
        widgetPosition: undefined,
        layoutOfSpace: undefined,
    });

    return {
        state,
    };
});
