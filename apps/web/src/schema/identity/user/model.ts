import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';
import type {
    AuthType, UserState, UserType, UserMfaState, UserMfaType,
} from '@/schema/identity/user/type';

export interface UserModel {
    user_id: string;
    name: string;
    email: string;
    email_verified: boolean;
    state: UserState;
    user_type: UserType;
    auth_type: AuthType; // backend
    role_type: RoleType;
    mfa?: UserMfa;
    required_actions: string[];
    language: string;
    timezone: string;
    tags: Tags;
    domain_id: string;
    last_accessed_at: TimeStamp;
    created_at: TimeStamp;
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
