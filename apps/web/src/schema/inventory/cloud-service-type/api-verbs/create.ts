import type { Tags } from '@/schema/_common/model';

export interface CloudServiceTypeCreateParameters {
    name: string;
    provider: string;
    group: string;
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
