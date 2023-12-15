import type { UserModel } from '@/schema/identity/user/model';
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
