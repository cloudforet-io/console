import type { Tags } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';

import type { PagePermission } from '@/lib/access-control/config';

export interface RoleCreateParameters {
    name: string;
    role_type: RoleType;
    api_permissions?: string[];
    page_permissions?: PagePermission[];
    tags?: Tags;
}
