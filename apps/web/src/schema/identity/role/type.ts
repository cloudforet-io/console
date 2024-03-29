import type { ROLE_TYPE } from '@/schema/identity/role/constant';

export type RoleType = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];

export interface Policy {
    policy_id: string;
    policy_type: string;
}
