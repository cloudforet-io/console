import type { Tags } from '@/schema/_common/model';

export interface UserConfigModel<T = Record<string, any>> {
    name: string;
    data: T;
    tags: Tags;
    user_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
