import type { Tags } from '@/schema/_common/model';
import type { CloudServiceQueryType } from '@/schema/inventory/cloud-service-query-set/type';

export interface CloudServiceQuerySetModel {
    query_set_id: string;
    name: string;
    state: 'ENABLED' | 'DISABLED';
    query_options: object;
    query_type: CloudServiceQueryType;
    unit: object;
    data_keys: string[];
    additional_info_keys: string[];
    provider: string;
    cloud_service_group: string;
    cloud_service_type: string;
    tags: Tags;
    resource_group: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
