import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { UserType } from '@/schema/identity/user/type';

import type { UserMfa } from '@/store/modules/user/type';

export interface UserModel {
    created_at: TimeStamp;
    domain_id?: string;
    email?: string;
    email_verified?: boolean;
    language: string;
    last_accessed_at: TimeStamp | number;
    name: string;
    state: string;
    tags?: Tags;
    timezone: string;
    user_id: string;
    backend: string;
    user_type: UserType;
    role_bindings?: RoleBindingModel[];
    mfa?: UserMfa;
}

