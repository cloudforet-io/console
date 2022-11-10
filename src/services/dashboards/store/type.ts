import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

export interface DashboardsState {
    workSpaceDashboardList: LNBItem[];
    projectDashboardList: LNBMenu[];
}
