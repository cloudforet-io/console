import type { Tags } from '@/schema/_common/model';

// collector api parameters
export interface CloudServiceTypeUpdateParameters {
    cloud_service_type_id: string;
    service_code?: string;
    is_primary?: boolean;
    is_major?: boolean;
    resource_type?: string;
    metadata?: {
        [key: string]: string;
    },
    labels?: string[];
    tags?: Tags;
}
