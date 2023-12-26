import type { Tags } from '@/schema/_common/model';

export interface CloudServiceTypeModel {
    cloud_service_type_id: string;
    cloud_service_type_key: string;
    name: string;
    provider: string;
    group: string;
    service_code: string;
    is_primary: boolean;
    is_major: boolean;
    resource_type: string;
    metadata: any;
    labels: string[];
    tags: Tags;
}
