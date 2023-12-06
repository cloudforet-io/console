import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { AuthType, UserState } from '@/schema/identity/user/type';

export interface WorkspaceUserModel {
    user_id: string;
    name: string;
    state: UserState;
    email: string;
    auth_type: AuthType;
    role_type: RoleType;
    tags: Tags;
    domain_id: string;
    created_at: TimeStamp;
    last_accessed_at: TimeStamp;
    api_key_count: number;
}
