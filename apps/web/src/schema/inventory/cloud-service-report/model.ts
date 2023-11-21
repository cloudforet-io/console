import type { Tags, TimeStamp } from '@/api-schema/common/model';

import type { RawPagePermission } from '@/lib/access-control/config';

export const ROLE_TYPE = Object.freeze({
    SYSTEM: 'SYSTEM',
    PROJECT: 'PROJECT',
    DOMAIN: 'DOMAIN',
} as const);
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
