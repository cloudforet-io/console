import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';

import type { RoleType } from '@/schema/identity/role/type';
import type { UserModel } from '@/schema/identity/user/model';
import type { AuthType } from '@/schema/identity/user/type';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

export type UserListItemType = Partial<WorkspaceUserModel> & Partial<UserModel>;

export interface ModalSettingState {
    type: string;
    title: string;
    themeColor: string;
    formVisible?: boolean;
    statusVisible?: boolean;
    addVisible?: boolean;
}

export interface AddModalMenuItem extends MenuItem {
    label?: string;
    name?: string;
    user_id?: string;
    role_type?: RoleType;
    auth_type?: AuthType;
    isNew?: boolean;
}

