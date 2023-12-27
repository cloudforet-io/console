import type { ResourceGroupType } from '@/schema/_common/type';
import type { PrivateDashboardCreateParameters } from '@/schema/dashboard/private-dashboard/api-verbs/create';
import type { PrivateDashboardDeleteParameters } from '@/schema/dashboard/private-dashboard/api-verbs/delete';
import type { PrivateDashboardGetParameters } from '@/schema/dashboard/private-dashboard/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/schema/dashboard/private-dashboard/api-verbs/list';
import type { PrivateDashboardUpdateParameters } from '@/schema/dashboard/private-dashboard/api-verbs/update';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import type { PublicDashboardDeleteParameters } from '@/schema/dashboard/public-dashboard/api-verbs/delete';
import type { PublicDashboardGetParameters } from '@/schema/dashboard/public-dashboard/api-verbs/get';
import type { PublicDashboardListParameters } from '@/schema/dashboard/public-dashboard/api-verbs/list';
import type { PublicDashboardUpdateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/update';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface DashboardModel extends PublicDashboardModel, PrivateDashboardModel {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
    project_id?: string;
    workspace_id?: string;
    user_id?: string;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface GetDashboardParameters extends PublicDashboardGetParameters, PrivateDashboardGetParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
export interface ListDashboardParameters extends PublicDashboardListParameters, PrivateDashboardListParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
export interface CreateDashboardParameters extends PublicDashboardCreateParameters, PrivateDashboardCreateParameters {
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id?: string;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface UpdateDashboardParameters extends PublicDashboardUpdateParameters, PrivateDashboardUpdateParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface DeleteDashboardParameters extends PublicDashboardDeleteParameters, PrivateDashboardDeleteParameters {
    public_dashboard_id?: string;
    private_dashboard_id?: string;
}
