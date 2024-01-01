import type { RoleType } from '@/schema/identity/role/type';
import type { GrantScope } from '@/schema/identity/token/type';
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
    mfa?: any
}

export interface SignInRequest {
    credentials: Record<string, any>;
    authType: AuthType;
    timeout?: number;
    refresh_count?: number;
    verify_code?: string;
    domainId: string;
}

// TODO: this will be replaced with UserModel
export interface UpdateUserRequest {
    user_id?: string;
    name?: string;
    password?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Record<string, any>;
    domain_id?: string
    verify_code?: string
    email_verified?: boolean
    mfa?: any
}

