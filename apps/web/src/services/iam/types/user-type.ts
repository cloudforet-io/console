import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import type { AuthType } from '@/api-clients/identity/user/schema/type';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

import type { LOCAL_TYPE } from '@/services/iam/constants/user-constant';

export type LocalType = typeof LOCAL_TYPE[keyof typeof LOCAL_TYPE];
interface RoleBindingState {
    type: RoleType;
    name: string;
}

export type UserListItemType = Partial<WorkspaceUserModel> & Partial<UserModel> & {
    role_binding?: RoleBindingState
};

export interface ExtendUserListItemType extends UserListItemType {
    mfa_state?: 'ON'|'OFF'
}

export type UserPageModalType = 'removeMixed' | 'removeOnlyWorkspaceGroup' | 'removeOnlyWorkspace' | 'add' | 'form' | 'status' | 'assignToUserGroup' | 'setMfa' | 'deleteMfaSecretKey';

export interface ModalSettingState {
    type: string;
    title: string | TranslateResult;
    themeColor: string;
    modalVisibleType?: UserPageModalType;
}

export interface ModalState {
    visible?: UserPageModalType;
    type: string;
    title: string | TranslateResult;
    themeColor: string;
}

export interface AddModalMenuItem extends MenuItem {
    label?: string;
    name?: string;
    user_id?: string;
    role_type?: RoleType;
    auth_type?: AuthType|LocalType;
    isNew?: boolean;
    workspace_id?: string;
    is_dormant?: boolean;
    tags?: Tags;
}

export interface AddAdminRoleFormState {
    role: Pick<AddModalMenuItem, 'name' | 'label' |'role_type'>;
    workspace?: Pick<AddModalMenuItem, 'name' | 'label' | 'is_dormant' | 'tags'>[];
    workspaceGroup?: Pick<AddModalMenuItem, 'name' | 'label' >[];
}

