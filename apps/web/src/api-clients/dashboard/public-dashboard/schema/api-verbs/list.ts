import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface PublicDashboardListParameters {
    query?: Query;
    dashboard_id?: string;
    name?: string;
    workspace_id?: string;
    project_id?: string;
    project_group_id?: string;
    folder_id?: string;
}
