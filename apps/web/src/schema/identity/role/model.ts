import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { Policy } from '@/schema/inventory/cloud-service-report/model';

import type { RawPagePermission } from '@/lib/access-control/config';

export interface RoleModel {
    created_at: TimeStamp;
    deleted_at?: TimeStamp;
    domain_id: string;
    name: string;
    policies?: Policy[];
    page_permissions: RawPagePermission[];
    role_id: string;
    role_type: RoleType;
    tags?: Tags; // [ description: string ]
}
