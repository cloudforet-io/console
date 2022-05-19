import { Store } from 'vuex';

import { PublicDashboardInfo, UserDashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { BudgetStoreState } from '@/services/cost-explorer/store/budget/type';
import { CostAnalysisStoreState } from '@/services/cost-explorer/store/cost-analysis/type';
import { CostDashboardState } from '@/services/cost-explorer/store/dashboard/type';

export interface CostExplorerState {
    publicDashboardList: PublicDashboardInfo[];
    userDashboardList: UserDashboardInfo[];
    dashboardListLoading: boolean;
}
export type CostExplorerStore = Store<CostExplorerState& {
    dashboard: CostDashboardState;
    costAnalysis: CostAnalysisStoreState;
    budget: BudgetStoreState;
}>
