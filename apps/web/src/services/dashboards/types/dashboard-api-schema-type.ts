import type { ResourceGroupType } from '@/schema/_common/type';
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
export interface GetDashboardParameters extends GetPublicDashboardParameters, GetPrivateDashboardParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
export interface ListDashboardParameters extends ListPublicDashboardParameters, ListPrivateDashboardParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
export interface CreateDashboardParameters extends CreatePublicDashboardParameters, CreatePrivateDashboardParameters {
    resource_group?: ResourceGroupType;
    project_id?: string;
}
export interface UpdateDashboardParameters extends UpdatePublicDashboardParameters, UpdatePrivateDashboardParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
export interface DeleteDashboardParameters extends DeletePublicDashboardParameters, DeletePrivateDashboardParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
