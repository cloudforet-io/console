import type { RoleType } from '@/api-clients/identity/role/type';
import type { GrantScope } from '@/api-clients/identity/token/schema/type';
import type { AuthType } from '@/api-clients/identity/user/schema/type';

export interface RoleInfo {
    roleType: RoleType;
    roleId: string;
    pageAccess: string[];
}

export interface GrantInfo {
    scope: GrantScope;
    workspaceId?: string;
    pageAccess?: string[];
}

export interface SignInRequest {
    credentials: Record<string, any>;
    authType: AuthType | 'SAML';
    timeout?: number;
    refresh_count?: number;
    verify_code?: string;
    domainId: string;
}

export interface JWTPayload {
    rol: RoleType;
}

