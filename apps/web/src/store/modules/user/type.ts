import type { SupportLanguage } from '@/translations/type';

import type { RawPagePermission } from '@/lib/access-control/config';

type UserType = 'USER' | 'DOMAIN_OWNER' | 'API_USER';
type UserBackend = 'LOCAL' | 'EXTERNAL';
type RoleType = 'SYSTEM' | 'DOMAIN' | 'PROJECT';
export type LanguageCode = 'ko' | 'en' | string;
// export type Timezone = 'UTC' | 'Asia/Seoul' | string;

export interface UserRole {
    roleId?: string;
    name: string;
    roleType: RoleType;
    pagePermissions: RawPagePermission[];
}

export interface UserState {
    isSessionExpired?: boolean;
    userId?: string;
    userType?: UserType;
    backend?: UserBackend;
    name?: string;
    email?: string;
    language?: SupportLanguage;
    timezone?: string;
    roles?: Array<UserRole>;
    requiredActions?: string[];
    emailVerified?: boolean;
}

export interface SignInRequest {
    domainId: string;
    userId?: string;
    userType: UserType;
    credentials: any;
}

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
}
