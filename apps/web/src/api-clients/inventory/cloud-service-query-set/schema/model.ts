import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { CloudServiceQueryType, CloudServiceQuerySetState } from '@/api-clients/inventory/cloud-service-query-set/schema/type';

export interface CloudServiceQuerySetModel {
    query_set_id: string;
    name: string;
    state: CloudServiceQuerySetState;
    query_options: object;
    query_type: CloudServiceQueryType;
    unit: Record<string, any>;
    data_keys: string[];
    additional_info_keys: string[];
    provider: string;
    cloud_service_group: string;
    cloud_service_type: string;
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'DOMAIN' | 'WORKSPACE'>;
    domain_id: string;
    workspace_id: string;
    created_at: string;
    updated_at: string;
}
