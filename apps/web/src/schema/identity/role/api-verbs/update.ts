import type { Tags } from '@/schema/_common/model';

export interface RoleUpdateParameters {
    role_id: string;
    name?: string;
    permissions?: string[];
    page_access?: string[];
    tags?: Tags;
}
