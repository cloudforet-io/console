import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType, Policy } from '@/schema/identity/role/type';

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

export interface PagePermission {
    pages: string[];
    permission: 'VIEW'|'MANAGE';
}

export interface RoleModel2 {
    role_id: string;
    name: string;
    role_type: RoleType;
    policies: Policy[];
    page_permissions: PagePermission[];
    tags?: Tags;
    is_managed: boolean;
    domain_id: string;
    created_at: TimeStamp;
}
