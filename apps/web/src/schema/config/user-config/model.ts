import type { Tags } from '@/schema/_common/model';

export interface UserConfigModel<T = Record<string, any>> {
    name: string;
    data: T;
    user_id: string;
    tags: Tags;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
