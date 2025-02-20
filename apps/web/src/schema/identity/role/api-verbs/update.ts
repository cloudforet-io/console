import type { Tags } from '@/api-clients/_common/schema/model';

export interface RoleUpdateParameters {
    role_id: string;
    name?: string;
    permissions?: string[];
    page_access?: string[];
    tags?: Tags;
}
