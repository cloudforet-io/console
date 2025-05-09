import type { ComputedRef } from 'vue';

import type { RoleType } from '@/api-clients/identity/role/type';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';
import type { AuthType, UserType } from '@/api-clients/identity/user/schema/type';


export type LanguageCode = 'ko' | 'en' | string;
// export type Timezone = 'UTC' | 'Asia/Seoul' | string;

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
    requiredActions?: string[];
    emailVerified?: boolean;
    isSignInLoading?: boolean;
    mfa?: UserMfa
}

export interface UserStoreGetters {
    isDomainAdmin: ComputedRef<boolean>;
    isSystemAdmin: ComputedRef<boolean>;
    languageLabel: ComputedRef<string>;
    hasAdminOrWorkspaceOwnerRole: ComputedRef<boolean>;
}
