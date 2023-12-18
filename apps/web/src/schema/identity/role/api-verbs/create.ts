import type { Tags } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';

export interface RoleCreateParameters {
    name: string;
    role_type: RoleType;
    permissions?: string[];
    page_access?: string[];
    tags?: Tags;
}
