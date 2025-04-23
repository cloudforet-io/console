import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

export const MANAGED_ROLES = {
    'managed-system-admin': ROLE_TYPE.SYSTEM_ADMIN,
    'managed-domain-admin': ROLE_TYPE.DOMAIN_ADMIN,
    'managed-workspace-owner': ROLE_TYPE.WORKSPACE_OWNER,
    'managed-workspace-member': ROLE_TYPE.WORKSPACE_MEMBER,
} as const;
