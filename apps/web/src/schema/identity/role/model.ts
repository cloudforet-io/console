import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';

import type { PagePermission } from '@/lib/access-control/config';

export interface RoleModel {
    role_id: string;
    name: string;
    role_type: RoleType;
    permission_scopes: string[];
    page_access: PagePermission[];
    tags?: Tags;
    is_managed: boolean;
    created_at: TimeStamp;
    updated_at: TimeStamp;
}
