import type { ComputedRef } from 'vue';

import type { RoleType } from '@/api-clients/identity/role/type';
import type { GrantScope } from '@/api-clients/identity/token/schema/type';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';
import type { AuthType, UserType } from '@/api-clients/identity/user/schema/type';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';



export type LanguageCode = 'ko' | 'en' | string;
// export type Timezone = 'UTC' | 'Asia/Seoul' | string;

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

export interface UserStoreState {
    isSessionExpired?: boolean;
    userId?: string;
    userType?: UserType;
    authType?: AuthType;
    roleType?: RoleType;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    currentGrantInfo?: GrantInfo;
    currentRoleInfo?: RoleInfo;
    requiredActions?: string[];
    emailVerified?: boolean;
    isSignInLoading?: boolean;
    mfa?: UserMfa
}

export interface UserStoreGetters {
    isDomainAdmin: ComputedRef<boolean>;
    isSystemAdmin: ComputedRef<boolean>;
    domainId: ComputedRef<string>;
    languageLabel: ComputedRef<string>;
    isNoRoleUser: ComputedRef<boolean>;
    hasAdminOrWorkspaceOwnerRole: ComputedRef<boolean>;
    hasPermission: ComputedRef<boolean>;
    pageAccessPermissionList: ComputedRef<MenuId[]>;
    pageAccessPermissionMap: ComputedRef<PageAccessMap>;
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

