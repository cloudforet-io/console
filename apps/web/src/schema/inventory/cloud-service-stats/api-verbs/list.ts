import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CloudServiceStatsListParameters {
    query?: Query;
    query_set_id:string;
    provider?: string;
    cloud_service_group?: string;
    cloud_service_type?: string;
    region_code?: string;
    account: string;
    project_id?: string;
    workspace_id?: string;
}
