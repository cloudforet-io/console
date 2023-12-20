import type { CreatePrivateDashboardParameters } from '@/schema/dashboard/private-dashboard/api-verbs/create';
import type { DeletePrivateDashboardParameters } from '@/schema/dashboard/private-dashboard/api-verbs/delete';
import type { GetPrivateDashboardParameters } from '@/schema/dashboard/private-dashboard/api-verbs/get';
import type { ListPrivateDashboardParameters } from '@/schema/dashboard/private-dashboard/api-verbs/list';
import type { UpdatePrivateDashboardParameters } from '@/schema/dashboard/private-dashboard/api-verbs/update';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { CreatePublicDashboardParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import type { DeletePublicDashboardParameters } from '@/schema/dashboard/public-dashboard/api-verbs/delete';
import type { GetPublicDashboardParameters } from '@/schema/dashboard/public-dashboard/api-verbs/get';
import type { ListPublicDashboardParameters } from '@/schema/dashboard/public-dashboard/api-verbs/list';
import type { UpdatePublicDashboardParameters } from '@/schema/dashboard/public-dashboard/api-verbs/update';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';


export interface DashboardModel extends PublicDashboardModel, PrivateDashboardModel {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
    project_id?: string;
    workspace_id?: string;
}
export type GetDashboardParameters = GetPublicDashboardParameters | GetPrivateDashboardParameters;
export type ListDashboardParameters = ListPublicDashboardParameters | ListPrivateDashboardParameters;
export type CreateDashboardParameters = CreatePublicDashboardParameters | CreatePrivateDashboardParameters;
export type UpdateDashboardParameters = UpdatePublicDashboardParameters | UpdatePrivateDashboardParameters;
export type DeleteDashboardParameters = DeletePublicDashboardParameters | DeletePrivateDashboardParameters;
