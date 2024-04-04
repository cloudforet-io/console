import type { Tags } from '@/schema/_common/model';

export interface CloudServiceTypeModel {
    cloud_service_type_id: string;
    name: string;
    provider: string;
    group: string;
    cloud_service_type_key: string;
    service_code: string;
    is_primary: boolean;
    is_major: boolean;
    resource_type: string;
    metadata: Record<string, any>;
    tags: Tags;
    labels: string[];
    domain_id: string;
    workspace_id: string;
    created_at: string;
    updated_at: string;
}
