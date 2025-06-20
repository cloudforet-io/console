import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CloudServiceTypeListParameters {
    query?: Query;
    cloud_service_type_id?: string;
    name?: string;
    provider?: string;
    group?: string;
    cloud_service_type_key?: string;
    service_code?: string;
    is_primary?: boolean;
    is_major?: boolean;
    resource_type?: string;
    workspace_id?: string;
}
