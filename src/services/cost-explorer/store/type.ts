import { PublicDashboardInfo, UserDashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';

export interface CostExplorerState {
    publicDashboardList: PublicDashboardInfo[];
    userDashboardList: UserDashboardInfo[];
    dashboardListLoading: boolean;
}
