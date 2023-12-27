import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { CloudServiceQueryType, CloudServiceQuerySetState } from '@/schema/inventory/cloud-service-query-set/type';


export interface CloudServiceQuerySetListParameters {
    query?: Query;
    query_set_id?:string;
    name?: string;
    state?: CloudServiceQuerySetState;
    query_type?: CloudServiceQueryType;
    provider?: string;
    cloud_service_group?: string;
    cloud_service_type?: string;
    workspace_id?: string;
}
