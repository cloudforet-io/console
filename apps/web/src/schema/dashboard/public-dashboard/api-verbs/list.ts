import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/schema/_common/type';


export interface ListPublicDashboardParameters {
    query?: Query;
    public_dashboard_id?: string;
    name?: string;
    user_id?: string;
    resource_group?: ResourceGroupType;
    project_id?: string;
    workspace_id?: string;
}
