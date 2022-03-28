import { Tags } from '@/models';

export interface CloudServiceTypeInfo {
    cloud_service_type_id: string;
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
