import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';


export interface ListDashboardParameters {
    query?: Query;
    dashboard_id?: string;
    name?: string;
    dashboard_type?: DashboardType;
    user_id?: string;
    resource_group?: ResourceGroupType;
    project_id?: string;
    workspace_id?: string;
}
