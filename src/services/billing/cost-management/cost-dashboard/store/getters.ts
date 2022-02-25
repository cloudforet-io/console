import { Getter } from 'vuex';
import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';

export const dashboardList: Getter<CostDashboardState, any> = (state) => {
    const publicList = state.publicDashboardList.map(d => ({
        ...d,
        dashboard_id: d.public_dashboard_id,
    }));
    const userList = state.userDashboardList.map(d => ({
        ...d,
        dashboard_id: d.user_dashboard_id,
    }));
    return [...publicList, ...userList];
};
