import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface DashboardModel extends PublicDashboardModel, PrivateDashboardModel {
    dashboard_id?: string;
    project_id?: string;
    workspace_id?: string;
    user_id?: string;
}
