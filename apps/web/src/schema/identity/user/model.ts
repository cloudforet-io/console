import type { Tags } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';
import type {
    AuthType, UserState, UserMfaState, UserMfaType,
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
    mfa_type: UserMfaType,
    options: {
        email: string,
    }
}

export interface UserSummaryModel {
    user_id: string;
    name: string;
    state: UserState;
}
