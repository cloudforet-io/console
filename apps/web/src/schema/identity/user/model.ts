import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { MultiFactorAuthType } from '@/schema/identity/user-profile/type';
import type {
    AuthType, UserState, UserMfaState,
} from '@/schema/identity/user/type';

export interface UserModel {
    user_id: string;
    name: string;
    state: UserState;
    email: string;
    email_verified: boolean;
    auth_type: AuthType; // backend
    role_type: RoleType;
    role_id?: string;
    mfa: UserMfa;
    language: string;
    timezone: string;
    api_key_count: number;
    required_actions: string[];
    tags: Tags;
    domain_id: string;
    created_at: string;
    last_accessed_at: string;
}

export interface UserMfa {
    state: UserMfaState,
    mfa_type: MultiFactorAuthType,
    options: {
        email?: string,
        user_secret_id?: string,
    }
}

export interface UserSummaryModel {
    user_id: string;
    name: string;
    state: UserState;
}

export interface UserGroupPerUserModel {
    user_group_id: string;
    name: string;
}
