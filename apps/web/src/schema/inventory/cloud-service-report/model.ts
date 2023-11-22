import type { Tags, TimeStamp } from '@/api-schema/common/model';
import type { ROLE_TYPE } from '@/api-schema/identity/role/constant';

import type { RawPagePermission } from '@/lib/access-control/config';

export type RoleType = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];

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

export interface Policy {
    policy_id: string;
    policy_type: string;
}
