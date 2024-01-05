import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { CloudServiceQueryType, CloudServiceQuerySetState } from '@/schema/inventory/cloud-service-query-set/type';

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
