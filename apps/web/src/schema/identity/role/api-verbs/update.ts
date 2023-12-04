import type { Tags } from '@/schema/_common/model';

import type { PagePermission } from '@/lib/access-control/config';

export interface RoleUpdateParameters {
    role_id: string;
    name?: string;
    api_permissions?: string[];
    page_permissions?: PagePermission[];
    tags?: Tags;
}
