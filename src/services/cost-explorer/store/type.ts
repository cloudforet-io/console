import type { Store } from 'vuex';

import type { PublicDashboardInfo, UserDashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import type { BudgetStoreState } from '@/services/cost-explorer/store/budget/type';
import type { CostDashboardState } from '@/services/cost-explorer/store/dashboard/type';

export interface CostExplorerState {
    publicDashboardList: PublicDashboardInfo[];
    userDashboardList: UserDashboardInfo[];
    dashboardListLoading: boolean;
}
export type CostExplorerStore = Store<CostExplorerState& {
    dashboard: CostDashboardState;
    budget: BudgetStoreState;
}>;
