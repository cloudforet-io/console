import type { Tags } from '@/api-clients/_common/schema/model';

export interface DomainConfigModel<T = Record<string, any>> {
    name: string;
    data: T;
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
