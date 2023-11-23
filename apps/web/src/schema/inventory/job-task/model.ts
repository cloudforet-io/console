import type { USER_TYPE } from '@/schema/identity/user/constant';

import type { Tags, TimeStamp } from '@/api-schema/common/model';
import type { RoleBindingModel } from '@/api-schema/identity/role-binding/model';

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
}

export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];
