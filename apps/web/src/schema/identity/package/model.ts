import type { Tags } from '@/schema/_common/model';

export interface PackageModel {
    package_id: string;
    name: string;
    description?: string;
    order: number;
    is_default: boolean;
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
