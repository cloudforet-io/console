import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { UserGroupPerUserModel } from '@/api-clients/identity/user/schema/model';
import type { AuthType, UserState } from '@/api-clients/identity/user/schema/type';

export interface WorkspaceUserModel {
    user_id: string;
    name: string;
    state: UserState;
    email: string;
    email_verified?: boolean;
    auth_type: AuthType;
    role_type: RoleType;
    language: string;
    timezone: string;
    api_key_count: number;
    tags: Tags;
    role_binding_info: RoleBindingModel;
    domain_id: string;
    created_at: string;
    last_accessed_at: string;
    user_group: UserGroupPerUserModel[];
}

export interface SummaryWorkspaceUserModel {
    user_id: string,
    name: string,
    state: UserState,
}
