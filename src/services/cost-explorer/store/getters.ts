import type { Getter } from 'vuex';

import { store } from '@/store';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { CostExplorerState } from '@/services/cost-explorer/store/type';

export const dashboardList: Getter<CostExplorerState, any> = (state) => {
    const publicList = state.publicDashboardList.map((d) => ({
        ...d,
        dashboard_id: d.public_dashboard_id,
    }));
    const userList = state.userDashboardList.map((d) => ({
        ...d,
        dashboard_id: d.user_dashboard_id,
    }));
    return [...publicList, ...userList];
};

export const homeDashboardId: Getter<CostExplorerState, any> = (): string|undefined => store.getters['settings/getItem']('homeDashboard', COST_EXPLORER_ROUTE.DASHBOARD._NAME);
