import type { RoleType } from '@/schema/identity/role/type';
import type { GrantScope } from '@/schema/identity/token/type';
import type { UserMfa } from '@/schema/identity/user/model';
import type { AuthType, UserType } from '@/schema/identity/user/type';



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

export interface UserState {
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

