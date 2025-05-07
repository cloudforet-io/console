import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface PrivateDashboardListParameters {
    query?: Query;
    dashboard_id?: string;
    name?: string;
    folder_id?: string;
}
