import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { RoleType } from '@/schema/identity/role/type';
import type { AuthType } from '@/schema/identity/user/type';

import type { LOCAL_TYPE } from '@/services/iam/constants/user-constant';

export type LocalType = typeof LOCAL_TYPE[keyof typeof LOCAL_TYPE];

export interface CreateModalMenuItem extends MenuItem {
    label?: string;
    name?: string;
    user_id?: string;
    role_type?: RoleType;
    auth_type?: AuthType | LocalType;
    isNew?: boolean;
    workspace_id?: string;
}
