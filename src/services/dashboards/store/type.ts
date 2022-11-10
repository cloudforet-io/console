import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

export interface DashboardsState {
    workSpaceList: LNBItem[];
    projectDashboardList: LNBMenu[];
}
