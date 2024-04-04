import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface PrivateDashboardListParameters {
    query?: Query;
    private_dashboard_id?: string;
    name?: string;
}
