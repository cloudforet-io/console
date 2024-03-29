export const ROLE_TYPE = {
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    DOMAIN_ADMIN: 'DOMAIN_ADMIN',
    WORKSPACE_OWNER: 'WORKSPACE_OWNER',
    WORKSPACE_MEMBER: 'WORKSPACE_MEMBER',
    USER: 'USER',
} as const;

export const MANAGED_ROLE_TYPE = {
    SYSTEM_ADMIN: 'managed-system-admin',
    DOMAIN_ADMIN: 'managed-domain-admin',
    WORKSPACE_OWNER: 'managed-workspace-owner',
    WORKSPACE_MEMBER: 'managed-workspace-member',
} as const;
